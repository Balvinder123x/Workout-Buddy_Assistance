"""Schemas for profile settings and account management."""
from pydantic import BaseModel, ConfigDict, Field


class ProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: str
    email: str
    age: int | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    goal: str | None = None
    bmi: float | None = None


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    age: int | None = Field(default=None, ge=10, le=120)
    height_cm: float | None = Field(default=None, gt=0, le=300)
    weight_kg: float | None = Field(default=None, gt=0, le=500)
    goal: str | None = Field(default=None, max_length=40)


class DeleteAccountRequest(BaseModel):
    confirm: str = Field(description="Must equal 'DELETE' to proceed")
