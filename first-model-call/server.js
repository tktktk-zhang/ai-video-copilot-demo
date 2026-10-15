const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/generate", async (req, res) => {
  const startTime = Date.now();

  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        status: 400,
        error: "请输入视频需求"
      });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({
        success: false,
        status: 500,
        error: "服务器未配置 API Key"
      });
    }

    const response = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-flash",
          messages: [
            {
              role: "system",
              content:
                "你是一个AI视频脚本助手。根据用户需求生成清晰、简洁、可执行的视频脚本。"
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 3000
        })
      }
    );

    const latency = Date.now() - startTime;

    if (!response.ok) {
      let upstreamError = {};

      try {
        upstreamError = await response.json();
      } catch {}

      return res.status(response.status).json({
        success: false,
        status: response.status,
        latency_ms: latency,
        error:
          upstreamError?.error?.message ||
          "模型 API 调用失败"
      });
    }

    const data = await response.json();

    const output =
      data?.choices?.[0]?.message?.content ||
      "模型没有返回可读内容";

    return res.status(200).json({
      success: true,
      status: 200,
      model: data.model || "deepseek-flash",
      latency_ms: latency,
      output
    });

  } catch (error) {
    const latency = Date.now() - startTime;

    console.error("API Error:", error.message);

    return res.status(500).json({
      success: false,
      status: 500,
      latency_ms: latency,
      error: "服务器调用模型失败，请稍后重试"
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI Video Copilot running at http://localhost:${PORT}`);
});