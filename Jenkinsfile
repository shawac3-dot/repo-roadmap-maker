pipeline {
    agent any 

    environment {
        DOCKER_CREDENTIALS_ID = 'roseaw-dockerhub'  
        DOCKER_IMAGE = 'cithit/shawac3'                                   //<-----change this to your MiamiID!
        IMAGE_TAG = "build-${BUILD_NUMBER}"
        GITHUB_URL = 'https://github.com/shawac3-dot/repo-roadmap-maker.git'     //<-----change this to match this new repository!
        KUBECONFIG = credentials('shawac3-225')                           //<-----change this to match your kubernetes credentials (MiamiID-225)! 
    }

    stages {
        stage('Code Checkout') {
            steps {
                cleanWs()
                checkout([$class: 'GitSCM', branches: [[name: '*/main']],
                          userRemoteConfigs: [[url: "${GITHUB_URL}"]]])
            }
        }
        
       stage('Lint HTML') {
            steps {
                sh 'npm install htmlhint --save-dev'
                sh 'npx htmlhint *.html'
            }
        }
        
        stage('Build & Push Docker Image') {
          steps {
            script {
              docker.withRegistry('https://registry.hub.docker.com', "${DOCKER_CREDENTIALS_ID}") {
                def app = docker.build("${DOCKER_IMAGE}:${IMAGE_TAG}", "-f Dockerfile .")
                app.push()
              }
            }
          }
        }

        stage('Deploy to Dev Environment') {
            steps {
                script {
                    // This sets up the Kubernetes configuration using the specified KUBECONFIG
                    def kubeConfig = readFile(KUBECONFIG)
                    sh "kubectl delete --all deployments --namespace=default"
                    // This updates the deployment-dev.yaml to use the new image tag
                    sh "sed -i 's|${DOCKER_IMAGE}:latest|${DOCKER_IMAGE}:${IMAGE_TAG}|' deployment-dev.yaml"
                    sh "kubectl apply -f deployment-dev.yaml"
                }
            }
        }
        
        stage ("Run Security Checks") {
            steps {
                //                                                                 ###change the IP address in this section to your cluster IP address!!!!####
                sh 'docker pull public.ecr.aws/portswigger/dastardly:latest'
                sh '''
                    docker run --user $(id -u) -v ${WORKSPACE}:${WORKSPACE}:rw \
                    -e BURP_START_URL=http://10.48.229.139 \
                    -e BURP_REPORT_FILE_PATH=${WORKSPACE}/dastardly-report.xml \
                    public.ecr.aws/portswigger/dastardly:latest
                '''
            }
        }
        
        stage('Reset DB After Security Checks') {
          steps {
            script {
              echo "Clearing test data from Supabase..."
              sh """
                curl -X POST \
                  -H "Content-Type: application/json" \
                  -d '{"action":"clear"}' \
                  https://yhmyhktdgzcanhgznqgy.supabase.co/functions/v1/test-data-manager
              """
            }
          }
        }
   
        stage('Generate Test Data') {
            steps {
                script {
                    echo "Generating test data in Supabase..."
                    sh """
                      curl -X POST \
                        -H "Content-Type: application/json" \
                        -d '{"action":"generate"}' \
                        https://yhmyhktdgzcanhgznqgy.supabase.co/functions/v1/test-data-manager
                    """
                }
            }
        }

        stage("Run Acceptance Tests") {
            steps {
                script {
                    sh 'docker stop qa-tests || true'
                    sh 'docker rm qa-tests || true'
                    sh 'docker build -t qa-tests -f Dockerfile.test .'
                    sh 'docker run -e TEST_URL=http://employee-scheduler-dev-service qa-tests'
                }
            }
        }
        
        stage('Remove Test Data') {
            steps {
                script {
                    echo "Removing test data from Supabase..."
                    sh """
                      curl -X POST \
                        -H "Content-Type: application/json" \
                        -d '{"action":"clear"}' \
                        https://yhmyhktdgzcanhgznqgy.supabase.co/functions/v1/test-data-manager
                    """
                }
            }
        }
          stage('Deploy to Prod Environment') {
            steps {
                script {
                    // Set up Kubernetes configuration using the specified KUBECONFIG
                    //sh "ls -la"
                    sh "sed -i 's|${DOCKER_IMAGE}:latest|${DOCKER_IMAGE}:${IMAGE_TAG}|' deployment-prod.yaml"
                    sh "cd .."
                    sh "kubectl apply -f deployment-prod.yaml"
                }
            }
        }     
        stage('Check Kubernetes Cluster') {
            steps {
                script {
                    sh "kubectl get all"
                }
            }
        }
    }

    post {

        success {
            slackSend color: "good", message: "Build Completed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        }
        unstable {
            slackSend color: "warning", message: "Build Completed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        }
        failure {
            slackSend color: "danger", message: "Build Completed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        }
    }
}
