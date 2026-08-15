const express = require("express");
const path = require("path");

const app = express();

// Render가 지정하는 PORT 사용
const PORT = process.env.PORT || 3000;

// public 폴더의 파일을 웹에서 사용
app.use(express.static(path.join(__dirname, "public")));

// 메인 페이지
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 서버 실행
app.listen(PORT, "0.0.0.0", () => {
    console.log("================================");
    console.log("💍 방긋 프로포즈 게임 서버 실행");
    console.log("================================");
    console.log(`PORT: ${PORT}`);
});