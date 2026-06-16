from transformers import CLIPProcessor, CLIPModel
from PIL import Image as PILImage
from io import BytesIO
import torch
import numpy as np

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def is_supported_image_content_type(content_type: str | None) -> bool:
    return content_type is not None and content_type.startswith("image/")

def convert_normalize(emb: np.ndarray) -> list[float]:
    # For normalized embeddings for cosine similarity, L2-normalize them
    emb = np.array(emb)
    emb = emb / np.linalg.norm(emb)
    emb = emb.tolist()
    return emb

def image_embed_bytes(data: bytes) -> list[float]:
    image = PILImage.open(BytesIO(data)).convert("RGB")
    return image_embed(image)

def image_embed(image: PILImage) -> list[float]:
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        out = model.get_image_features(**inputs)
        image_emb = out.pooler_output[0].cpu().numpy() # It is usually used for many images or texts at once, that is why [0] is required

    return convert_normalize(image_emb)

def text_embed(text: str) -> list[float]:
    inputs = processor(text=text, return_tensors="pt", padding=True)

    with torch.no_grad():
        text_out = model.get_text_features(**inputs)
        text_emb = text_out.pooler_output[0].cpu().numpy()

    return convert_normalize(text_emb)
