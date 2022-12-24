from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in erevive_whatsapp/__init__.py
from erevive_whatsapp import __version__ as version

setup(
	name="erevive_whatsapp",
	version=version,
	description="Erevive Whatsapp",
	author="Laxman",
	author_email="laxmantandon@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
