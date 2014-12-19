@echo off

rem :: http://sevenzip.sourceforge.jp/chm/cmdline/commands/add.htm

7z a -tzip -scsUTF-8 "modify-response-headers.xpi" ".\chrome.manifest" ".\install.rdf" ".\install.js" "chrome\" "components\" "defaults\"
