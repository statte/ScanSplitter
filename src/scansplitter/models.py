"""Model download and management for face detection and orientation detection."""

import sys
import urllib.request
from pathlib import Path

# Model URLs from OpenCV's GitHub (face detection)
PROTOTXT_URL = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt"
CAFFEMODEL_URL = "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"

# Orientation detection model (EfficientNetV2 ONNX)
# Primary: original source, Fallback: our own backup
ORIENTATION_MODEL_URLS = [
    "https://github.com/duartebarbosadev/deep-image-orientation-detection/releases/download/v2/orientation_model_v2_0.9882.onnx",
    "https://github.com/Madnex/ScanSplitter/releases/download/models-v1/orientation_model_v2.onnx",
]
ORIENTATION_MODEL_FILENAME = "orientation_model_v2.onnx"

# U2-Net salient object detection models (ONNX)
# u2netp is the lightweight version (~4.7MB), u2net is the full version (~176MB)
U2NETP_MODEL_URLS = [
    "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx",
    "https://github.com/Madnex/ScanSplitter/releases/download/models-v1/u2netp.onnx",
]
U2NETP_MODEL_FILENAME = "u2netp.onnx"

U2NET_MODEL_URLS = [
    "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx",
    "https://github.com/Madnex/ScanSplitter/releases/download/models-v1/u2net.onnx",
]
U2NET_MODEL_FILENAME = "u2net.onnx"

# Cache directory for models
MODELS_DIR = Path(__file__).parent / "model_cache"


def get_model_paths() -> tuple[Path, Path]:
    """Get paths to the face detection model files, downloading if needed.

    Returns:
        Tuple of (prototxt_path, caffemodel_path)
    """
    MODELS_DIR.mkdir(exist_ok=True)

    prototxt_path = MODELS_DIR / "deploy.prototxt"
    caffemodel_path = MODELS_DIR / "res10_300x300_ssd_iter_140000.caffemodel"

    if not prototxt_path.exists():
        print("Downloading face detection prototxt...")
        urllib.request.urlretrieve(PROTOTXT_URL, prototxt_path)

    if not caffemodel_path.exists():
        print("Downloading face detection model (10MB)...")
        urllib.request.urlretrieve(CAFFEMODEL_URL, caffemodel_path)

    return prototxt_path, caffemodel_path


def _download_with_progress(url: str, dest: Path, description: str) -> None:
    """Download a file with progress reporting."""

    def report_progress(block_num: int, block_size: int, total_size: int) -> None:
        if total_size > 0:
            downloaded = block_num * block_size
            percent = min(100, downloaded * 100 // total_size)
            mb_downloaded = downloaded / (1024 * 1024)
            mb_total = total_size / (1024 * 1024)
            sys.stdout.write(f"\r{description}: {mb_downloaded:.1f}/{mb_total:.1f} MB ({percent}%)")
            sys.stdout.flush()

    urllib.request.urlretrieve(url, dest, reporthook=report_progress)
    print()  # Newline after progress


def get_orientation_model_path() -> Path:
    """Get path to the orientation detection ONNX model, downloading if needed.

    Tries multiple URLs in order (primary source, then backup).

    Returns:
        Path to the ONNX model file
    """
    MODELS_DIR.mkdir(exist_ok=True)

    model_path = MODELS_DIR / ORIENTATION_MODEL_FILENAME

    if not model_path.exists():
        print("Downloading orientation detection model (~80MB)...")
        for i, url in enumerate(ORIENTATION_MODEL_URLS):
            try:
                _download_with_progress(url, model_path, "Downloading")
                break
            except Exception as e:
                if i < len(ORIENTATION_MODEL_URLS) - 1:
                    print(f"\nPrimary URL failed, trying backup...")
                else:
                    raise RuntimeError(f"Failed to download orientation model: {e}") from e

    return model_path


def get_u2net_model_path(lite: bool = True) -> Path:
    """Get path to the U2-Net salient object detection ONNX model.

    Downloads the model on first use if not already cached.

    Args:
        lite: If True, use u2netp (4.7MB, faster). If False, use u2net (176MB, more accurate).

    Returns:
        Path to the ONNX model file
    """
    MODELS_DIR.mkdir(exist_ok=True)

    if lite:
        urls = U2NETP_MODEL_URLS
        filename = U2NETP_MODEL_FILENAME
        size_desc = "~5MB"
    else:
        urls = U2NET_MODEL_URLS
        filename = U2NET_MODEL_FILENAME
        size_desc = "~176MB"

    model_path = MODELS_DIR / filename

    if not model_path.exists():
        print(f"Downloading U2-Net {'lite' if lite else 'full'} model ({size_desc})...")
        for i, url in enumerate(urls):
            try:
                _download_with_progress(url, model_path, "Downloading")
                break
            except Exception as e:
                if i < len(urls) - 1:
                    print(f"\nPrimary URL failed, trying backup...")
                else:
                    raise RuntimeError(f"Failed to download U2-Net model: {e}") from e

    return model_path
