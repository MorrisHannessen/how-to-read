$ErrorActionPreference = "Stop"

& npx -y "github:MorrisHannessen/how-to-read" -- @args
exit $LASTEXITCODE
