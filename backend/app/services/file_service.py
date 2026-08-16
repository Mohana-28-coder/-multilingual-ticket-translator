import os
import uuid
import aiofiles
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile
import PyPDF2
from docx import Document
from PIL import Image
import io
import logging

from ..config import settings

logger = logging.getLogger(__name__)

class FileService:
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.max_size = settings.MAX_FILE_SIZE
        self.allowed_extensions = settings.ALLOWED_EXTENSIONS
    
    def _get_extension(self, filename: str) -> str:
        return Path(filename).suffix.lower()
    
    def _generate_unique_filename(self, original_filename: str) -> str:
        ext = self._get_extension(original_filename)
        unique_id = uuid.uuid4().hex[:12]
        return f"{unique_id}{ext}"
    
    async def save_file(self, file: UploadFile) -> Tuple[str, str, int, str]:
        """
        Save uploaded file and return (saved_filename, original_filename, file_size, file_type).
        """
        original_filename = file.filename
        ext = self._get_extension(original_filename)
        
        if ext not in self.allowed_extensions:
            raise ValueError(f"File type {ext} not allowed")
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        if file_size > self.max_size:
            raise ValueError(f"File size exceeds maximum allowed ({self.max_size // (1024*1024)}MB)")
        
        # Generate unique filename
        saved_filename = self._generate_unique_filename(original_filename)
        file_path = self.upload_dir / saved_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Determine file type
        file_type = self._get_file_type(ext)
        
        return saved_filename, original_filename, file_size, file_type
    
    def _get_file_type(self, ext: str) -> str:
        type_mapping = {
            '.pdf': 'pdf',
            '.png': 'image',
            '.jpg': 'image',
            '.jpeg': 'image',
            '.gif': 'image',
            '.doc': 'document',
            '.docx': 'document',
            '.txt': 'text',
            '.xlsx': 'spreadsheet',
            '.csv': 'spreadsheet'
        }
        return type_mapping.get(ext, 'other')
    
    def extract_text(self, file_path: str) -> Optional[str]:
        """Extract text content from various file types."""
        try:
            full_path = self.upload_dir / file_path
            ext = self._get_extension(file_path)
            
            if ext == '.pdf':
                return self._extract_pdf_text(full_path)
            elif ext == '.txt':
                return self._extract_txt_text(full_path)
            elif ext in ['.doc', '.docx']:
                return self._extract_docx_text(full_path)
            elif ext in ['.png', '.jpg', '.jpeg', '.gif']:
                # OCR could be added here
                return None
            else:
                return None
        except Exception as e:
            logger.error(f"Text extraction error: {e}")
            return None
    
    def _extract_pdf_text(self, file_path: Path) -> str:
        text_parts = []
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            for page in pdf_reader.pages:
                text_parts.append(page.extract_text())
        return '\n'.join(text_parts)
    
    def _extract_txt_text(self, file_path: Path) -> str:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def _extract_docx_text(self, file_path: Path) -> str:
        doc = Document(file_path)
        return '\n'.join([para.text for para in doc.paragraphs])
    
    def delete_file(self, filename: str) -> bool:
        """Delete a file from storage."""
        try:
            file_path = self.upload_dir / filename
            if file_path.exists():
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            logger.error(f"File deletion error: {e}")
            return False
    
    def get_file_path(self, filename: str) -> Optional[Path]:
        """Get full path of a file if it exists."""
        file_path = self.upload_dir / filename
        return file_path if file_path.exists() else None

file_service = FileService()