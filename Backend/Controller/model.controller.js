const { GoogleGenAI } = require('@google/genai');
const sessionModel = require('../Model/chatSession.model.js');
const { validationResult } = require('express-validator');
const userModel = require('../Model/user.model.js');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});


exports.chatbox = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: "failed", errors: errors.array() });
        }
        const { sessionId, userPrompt, userId } = req.body;

        // verify UserId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ status: "Failed", message: "Unauthorized User" })
        }

        let sessionDetail;

        if (sessionId && typeof sessionId === 'string') {
            sessionDetail = await sessionModel.findById(sessionId);
        }

        if (!sessionDetail) {
            sessionDetail = new sessionModel({
                title: "New Chat",
                userId,
                history: [],
            });
        }

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: JSON.parse(JSON.stringify(sessionDetail.history || [])),
        });

        const response = await chat.sendMessage({
            message: userPrompt,
        });

        const reply = response.text;

        sessionDetail.history = chat.getHistory();
        if (!sessionDetail.title || sessionDetail.title === "New Chat") {
            try {
                const titleContext = sessionDetail.history
                    .slice(0, 10)
                    .map((msg) => `${msg.role}: ${msg.parts[0].text}`)
                    .join("\n");

                const titleGen = ai.chats.create({
                    model: "gemini-2.5-flash",
                });

                const titleRes = await titleGen.sendMessage({
                    message: `This is converstaion b/w user and model generate a title for this conversation in max 3-5 words no extra text:\n${titleContext}`,
                });

                let rawTitle;
                if (typeof titleRes.text === "function") {
                    rawTitle = await titleRes.text();
                } else {
                    rawTitle =
                        titleRes?.candidates?.[0]?.content?.parts?.[0]?.text ||
                        "Untitled Chat";
                }

                const cleanTitle = rawTitle.replace(/\*/g, "").replace(/["']/g, "").trim();
                sessionDetail.title = cleanTitle;

                console.log("✅ Generated title:", cleanTitle);
            } catch (titleErr) {
                console.warn("⚠️ Title generation failed:", titleErr.message);
            }
        }

        await sessionDetail.save();

        res.json({
            success: true,
            sessionId: sessionDetail._id,
            reply,
        });
    } catch (error) {
        console.error('Chatbox Error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong.',
            error: error.message,
        });
    }
};

exports.unauth_chatbot = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "failed", errors: errors.array() });
    }
    const {userPrompt} = req.body
    const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [],
  });

  const response = await chat.sendMessage({
    message: userPrompt,
  });
  if(!response){
    return res.status(400).json({
        status: "Failed",
        message: "Something went wrong"
    })
  }
  res.status(200).json({
    reply: response.text
  })

}

exports.getHistory = async (req, res) => {
    const { userid } = req.body
    if (!userid) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid user Id"
        })
    }
    const history = await sessionModel.find({ userId: userid })
    if (!history) {
        return res.status(400).json({
            status: "Failed",
            message: "Something went wrong try again"
        })
    }
    res.status(200).json({
        status: "Success",
        history
    })
}

exports.getSession = async (req, res) => {
    const { userid, sessionid } = req.body
    if (!userid || !sessionid) {
        return res.status(400).json({
            status: "Failed",
            message: "Something went wrong"
        })
    }
    const history = await sessionModel.findOne({
        userId: userid,
        _id: sessionid
    })
    if (!history) {
        return res.status(400).json({
            status: "Failed",
            message: "Something went wrong"
        })
    }
    res.status(200).json({
        session: history
    })
}

exports.deleteSession = async (req,res) => {
    const {id} = req.body
    if(!id){
        return res.status(400).json({
            status: "Failed",
            message: "Failed to delete"
        })
    }
    const response = await sessionModel.findByIdAndDelete(id);
    if(!response){
        return res.staatus(400).json({
            status: "Failed",
            message: "Deletion failed"
        })
    }
    res.status(200).json({
        status: "Success",
        message: "Session Deleted Successfully"
    })
}
