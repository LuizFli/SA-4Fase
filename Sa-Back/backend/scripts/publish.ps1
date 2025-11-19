param(
    [string]$DockerUser = 'luizfli',
    [string]$Tag = 'latest'
)

Write-Host "Publish script: will tag local image 'sa-backend:latest' and push to $DockerUser/sa-backend:$Tag"

# Check docker is available
try {
    docker --version > $null 2>&1
} catch {
    Write-Error "Docker não encontrado no PATH. Instale Docker Desktop e tente novamente."
    exit 1
}

# Verify local image exists
$localImage = 'sa-backend:latest'
$exists = docker images --format '{{.Repository}}:{{.Tag}}' | Select-String -Pattern "^$localImage$"
if (-not $exists) {
    Write-Error "Imagem local '$localImage' não encontrada. Rode 'docker build -t sa-backend:latest .' primeiro."
    exit 1
}

$target = "$DockerUser/sa-backend:$Tag"
Write-Host "Tagging $localImage -> $target"
docker tag $localImage $target

Write-Host "Faça login no Docker Hub se ainda não estiver autenticado: 'docker login'"
Write-Host "Enviando imagem para Docker Hub..."

$pushResult = docker push $target 2>&1
Write-Host $pushResult

if ($LASTEXITCODE -ne 0) {
    Write-Error "Push falhou. Verifique se você fez 'docker login' e se o repositório '$DockerUser/sa-backend' existe ou se suas credenciais têm permissão."
    exit $LASTEXITCODE
}

Write-Host "Imagem enviada com sucesso: $target"
