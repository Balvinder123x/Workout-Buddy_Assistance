"""Schemas for the AI coach chat."""
from pydantic import BaseModel, Field


class ChatTurn(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatTurn] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    source: str  # "gemini" | "local"
