import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import recommendationRouter from "./routes/recommendation.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8787

app.use(cors())
app.use(express.json({ limit: "2mb" }))
app.use("/api", recommendationRouter)

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "crew-sync-backend" })
})

app.listen(PORT, () => {
  console.log(`Crew Sync backend listening on http://localhost:${PORT}`)
})
