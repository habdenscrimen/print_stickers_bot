deploy:
	npm run build

	docker build -t dashboard-handler . --platform=linux/amd64
	aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 962008107893.dkr.ecr.eu-central-1.amazonaws.com
	docker tag dashboard-handler:latest 962008107893.dkr.ecr.eu-central-1.amazonaws.com/dashboard-handler:latest
	docker push 962008107893.dkr.ecr.eu-central-1.amazonaws.com/dashboard-handler:latest

	aws lambda update-function-code --region eu-central-1 --function-name dashboardHandler \
		--image-uri 962008107893.dkr.ecr.eu-central-1.amazonaws.com/dashboard-handler:latest
