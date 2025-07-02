import random

from novelai_python import ApiCredential
from novelai_python.sdk.ai._enum import Model, Sampler, UCPreset, NoiseSchedule
from novelai_python.sdk.ai.generate_image import PositionMap, Character, GenerateImageInfer, Params, V4Prompt
from pydantic import SecretStr

credential:ApiCredential

def create_character(prompt,uc,position=PositionMap.C3):
    return Character(
        prompt=prompt,
        uc=uc,
        center=position,
        enabled=True
    )

def create_model(token,prompt,uc,characters=(),steps=23,scale=5.0,noise_schedule=NoiseSchedule.KARRAS,noise=0.0,width=1024,height=1024,variety_boost=True,model=Model.NAI_DIFFUSION_4_5_FULL,sampler=Sampler.K_EULER_ANCESTRAL) -> GenerateImageInfer:
    global credential
    credential = ApiCredential(api_token=SecretStr(token))

    agent = GenerateImageInfer.build_generate(
        prompt=prompt,
        negative_prompt=uc,
        steps=steps,
        width=width,
        height=height,
        model=model,
        character_prompts=characters,
        sampler=sampler,
        ucPreset=UCPreset.TYPE2,
        qualityToggle=False,
        decrisp_mode=False,
        variety_boost=variety_boost,
    ).set_mutual_exclusion(True)
    agent.parameters.legacy=False
    agent.parameters.noise=noise
    agent.parameters.noise_schedule=noise_schedule
    agent.parameters.scale=scale
    agent.parameters.params_version=4
    return agent

def generate_image(model:GenerateImageInfer,seed=None):
    model.parameters.seed = random.randint(0, 4294967295 - 7) if seed is None else seed
    return model.request(session=credential)

def analyze_image(image):
    # NovelAIの生成画像に対してiTxt情報を取得し返却
    pass