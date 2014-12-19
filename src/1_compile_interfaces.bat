@echo off

rem :: Gecko SDK
rem ::    https://developer.mozilla.org/en-US/docs/Gecko_SDK
rem ::    http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/3.6.28/sdk/xulrunner-3.6.28.en-US.win32.sdk.zip
rem :: note:
rem ::    appears to be portable

rem :: point this to the directory where the Gecko SDK has been uncompressed
if not defined xulrunner_sdk_home (
	set xulrunner_sdk_home=C:\xulrunner-sdk
)
set XPIDL_EXE=%xulrunner_sdk_home%\bin\xpidl.exe
set XPIDL_INC=%xulrunner_sdk_home%\idl

cd /D "%~dp0."

set TPL_SRC=interface
set TPL_TRG=components

@echo on
%XPIDL_EXE% -m typelib -v -I %XPIDL_INC% -w -o %TPL_TRG%/nsIModifyheaders %TPL_SRC%/nsIModifyheaders.idl
%XPIDL_EXE% -m typelib -v -I %XPIDL_INC% -w -o %TPL_TRG%/mhIHeader %TPL_SRC%/mhIHeader.idl
