import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const LEONARDO_API_URL = "https://cloud.leonardo.ai/api/rest/v1";

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("Hello from Express backend!");
});

app.post("/api/generations", async (req, res) => {
  const { prompt, modelId, ...restParams } = req.body;
  const apiKey = process.env.LEONARDO_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "API key for Leonardo.ai is not configured." });
  }
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const payload = {
      prompt: prompt,
      modelId: modelId || "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3", // 기본 모델 (Leonardo Diffusion XL)
      width: 1024, // 기획서 기반 기본값 또는 사용자 선택
      height: 1024, // 기획서 기반 기본값 또는 사용자 선택
      num_images: 1, // 기획서 기반 기본값 또는 사용자 선택
      ...restParams, // 프롬프트, 모델ID 외 기타 파라미터 (예: negative_prompt, guidance_scale 등)
    };

    const response = await axios.post(
      `${LEONARDO_API_URL}/generations`,
      payload,
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error generating image:",
      error.response
        ? JSON.stringify(error.response.data, null, 2)
        : error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Failed to start image generation",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/generations/:generationId", async (req, res) => {
  const { generationId } = req.params;
  const apiKey = process.env.LEONARDO_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "API key for Leonardo.ai is not configured." });
  }

  try {
    const response = await axios.get(
      `${LEONARDO_API_URL}/generations/${generationId}`,
      {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${apiKey}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching generation status:",
      error.response
        ? JSON.stringify(error.response.data, null, 2)
        : error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch generation status",
      details: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
