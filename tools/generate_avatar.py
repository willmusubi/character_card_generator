#!/usr/bin/env python3
"""
Mufy 角色卡头像生成器
使用 Google Nano Banana (Gemini 2.5 Flash Image) 根据角色人设生成头像
"""

import os
import sys
from pathlib import Path

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("请先安装 google-genai SDK:")
    print("  pip install google-genai")
    sys.exit(1)

# ============ 配置 ============
# 设置你的 Google API Key
# 获取方式: https://aistudio.google.com/apikey
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "")

# 模型选择
# - gemini-2.5-flash-image: 快速版 (Nano Banana)
# - gemini-3-pro-image-preview: 专业版 (Nano Banana Pro)
MODEL = "gemini-2.5-flash-image"

# 输出目录
OUTPUT_DIR = Path(__file__).parent / "avatars"


def generate_avatar_prompt(character_info: dict) -> str:
    """
    根据角色信息生成图像 prompt
    """
    # 基础风格设定
    style_base = """
    High quality character portrait, anime style, vertical composition 3:4 aspect ratio,
    soft lighting, detailed features, beautiful artwork, masterpiece quality,
    suitable for avatar/profile picture use
    """

    # 组合角色外貌描述
    appearance = character_info.get("appearance", "")
    clothing = character_info.get("clothing", "")
    personality_vibe = character_info.get("personality_vibe", "")
    setting = character_info.get("setting", "")

    prompt = f"""
    {style_base}

    Character appearance: {appearance}
    Clothing: {clothing}
    Expression/Mood: {personality_vibe}
    Background/Setting: {setting}

    Focus on face and upper body, portrait shot, looking at viewer
    """

    return prompt.strip()


def generate_avatar(prompt: str, output_path: str = None) -> str:
    """
    调用 Nano Banana API 生成头像

    Args:
        prompt: 图像生成提示词
        output_path: 输出文件路径 (可选)

    Returns:
        生成的图片文件路径
    """
    if not GOOGLE_API_KEY:
        raise ValueError(
            "请设置 GOOGLE_API_KEY 环境变量\n"
            "获取方式: https://aistudio.google.com/apikey\n"
            "设置方式: export GOOGLE_API_KEY='your-api-key'"
        )

    # 初始化客户端
    client = genai.Client(api_key=GOOGLE_API_KEY)

    print(f"正在使用 {MODEL} 生成头像...")
    print(f"Prompt: {prompt[:100]}...")

    # 调用 API 生成图像
    response = client.models.generate_content(
        model=MODEL,
        contents=[prompt],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        )
    )

    # 确保输出目录存在
    OUTPUT_DIR.mkdir(exist_ok=True)

    # 处理响应
    for part in response.parts:
        if part.inline_data is not None:
            # 获取图像
            image = part.as_image()

            # 确定输出路径
            if output_path is None:
                output_path = OUTPUT_DIR / "avatar.png"
            else:
                output_path = Path(output_path)

            # 保存图像
            image.save(str(output_path))
            print(f"头像已保存到: {output_path}")
            return str(output_path)

        elif part.text is not None:
            print(f"模型回复: {part.text}")

    raise RuntimeError("未能生成图像，请检查 prompt 或稍后重试")


# ============ 貂蝉角色信息 ============
DIAOCHAN_INFO = {
    "name": "貂蝉",
    "appearance": """
    A stunningly beautiful ancient Chinese woman, age 19.
    Skin as fair as snow, delicate and flawless.
    Willow-leaf eyebrows above almond-shaped eyes that shimmer with emotion,
    slightly upturned at the corners giving a natural allure.
    Small cherry lips, elegant nose.
    Long raven-black hair styled up with jade hairpins,
    some strands gently flowing, subtle fragrance.
    Graceful slender figure, movements like a willow in the breeze.
    """,
    "clothing": """
    Elegant silk hanfu dress in pale colors - moon white, light pink, or water blue.
    Jade pendant at the waist, pearl earrings.
    Simple but refined makeup, natural ethereal beauty.
    Ancient Chinese Three Kingdoms era style.
    """,
    "personality_vibe": """
    Gentle and composed expression, with hidden inner strength.
    Eyes showing intelligence and subtle melancholy.
    A hint of mysterious smile, elegant and dignified demeanor.
    """,
    "setting": """
    Moonlit night in an ancient Chinese garden,
    soft moonlight illuminating her face,
    perhaps near a guqin (Chinese zither) or peach blossoms.
    Atmospheric and romantic Three Kingdoms era aesthetic.
    """
}


def main():
    """主函数"""
    print("=" * 50)
    print("Mufy 角色卡头像生成器")
    print("使用 Google Nano Banana API")
    print("=" * 50)

    # 检查 API Key
    if not GOOGLE_API_KEY:
        print("\n错误: 未设置 GOOGLE_API_KEY")
        print("\n请按以下步骤操作:")
        print("1. 访问 https://aistudio.google.com/apikey 获取 API Key")
        print("2. 设置环境变量:")
        print("   export GOOGLE_API_KEY='your-api-key-here'")
        print("3. 重新运行此脚本")
        return

    # 生成貂蝉头像
    print(f"\n正在为「{DIAOCHAN_INFO['name']}」生成头像...\n")

    # 生成 prompt
    prompt = generate_avatar_prompt(DIAOCHAN_INFO)

    # 生成头像
    try:
        output_path = OUTPUT_DIR / f"{DIAOCHAN_INFO['name']}_avatar.png"
        result = generate_avatar(prompt, output_path)
        print(f"\n生成完成! 文件保存在: {result}")
    except Exception as e:
        print(f"\n生成失败: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
