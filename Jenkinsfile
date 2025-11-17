pipeline {
    agent any
    
    environment {
        DOCKER_CREDENTIALS_ID = 'roseaw-dockerhub'
        DOCKER_IMAGE = 'cithit/shawac3'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        GITHUB_URL = 'https://github.com/shawac3-dot/repo-roadmap-maker.git'
        KUBECONFIG_CREDENTIALS_ID = 'kubeconfig'
    }
    
    stages {
        stage('Checkout') {
            steps {
                cleanWs()
                checkout([$class: 'GitSCM', branches: [[name: '*/main']],
                          userRemoteConfigs: [[url: "${GITHUB_URL}"]]])
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    docker.build("${DOCKER_IMAGE}:latest")
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_CREDENTIALS_ID) {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                        docker.image("${DOCKER_IMAGE}:latest").push()
                    }
                }
            }
        }
        
        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    withKubeConfig([credentialsId: KUBECONFIG_CREDENTIALS_ID]) {
                        sh 'kubectl apply -f deployment-dev.yaml'
                        sh 'kubectl rollout status deployment/employee-scheduler-dev'
                    }
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    withKubeConfig([credentialsId: KUBECONFIG_CREDENTIALS_ID]) {
                        sh 'kubectl apply -f deployment-prod.yaml'
                        sh 'kubectl rollout status deployment/employee-scheduler-prod'
                    }
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    withKubeConfig([credentialsId: KUBECONFIG_CREDENTIALS_ID]) {
                        if (env.BRANCH_NAME == 'main') {
                            sh 'kubectl get pods -l app=employee-scheduler,environment=production'
                            sh 'kubectl get service employee-scheduler-prod-service'
                        } else if (env.BRANCH_NAME == 'develop') {
                            sh 'kubectl get pods -l app=employee-scheduler,environment=development'
                            sh 'kubectl get service employee-scheduler-dev-service'
                        }
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
        cleanup {
            cleanWs()
        }
    }
}
