@echo off
chcp 65001 >nul
REM KPSS Çalış — Windows kurulum ve yayınlama betiği
REM Kullanım: C:\dev\kpsscalis klasöründe bu dosyaya çift tıkla.

echo.
echo === KPSS Calis kurulumu ===
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi. https://nodejs.org adresinden LTS surumunu kurup bu dosyayi tekrar calistir.
  pause
  exit /b 1
)

echo 1/3 Paketler kuruluyor...
call npm install --no-audit --no-fund
if errorlevel 1 goto hata

echo.
echo 2/3 Cloudflare hesabina giris (tarayici acilacak, "Allow" de)...
call npx wrangler login
if errorlevel 1 goto hata

echo.
echo 3/3 Site Cloudflare'e yukleniyor...
call npx wrangler deploy
if errorlevel 1 goto hata

echo.
echo Tamam! Yukarida yazan https://kpss-ozgur.....workers.dev adresini telefonunda ac.
echo Telefonda tarayici menusunden "Ana ekrana ekle" dersen uygulama gibi calisir.
pause
exit /b 0

:hata
echo.
echo Bir hata oldu. Yukaridaki mesaji Claude'a gonderebilirsin.
pause
exit /b 1
