from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.template.utils import get_app_template_dirs


class Command(BaseCommand):
    help = "List all template files"

    def handle(self, *args, **options):
        template_files = []
        app_template_dirs = get_app_template_dirs("templates")
        for app_template_dir in app_template_dirs:
            template_files += self.list_template_files(app_template_dir)
        for template_dir in settings.TEMPLATES[0]["DIRS"]:
            template_files += self.list_template_files(template_dir)
        self.stdout.write("\n".join(template_files))

    def list_template_files(self, template_dir):
        template_files = []
        for file_path in Path(template_dir).rglob("*"):
            if file_path.is_file() and file_path.suffix in [".html", ".txt"]:
                template_files.append(str(file_path))
        return template_files
