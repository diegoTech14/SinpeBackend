<div align="center">


  <h1>Sinpe Móvil Backend 📱</h1>
  
  <p>
    This repository contains the backend of a wink mobile sinpe simulator which is worked with AWS using HTTP API and API Gateway, in addition to this it uses a dynamodb database integrated within the services
  </p>
     
</div>

<br />
  
<!-- About the Project -->
## 🖥 About the Project


<!-- Screenshots -->
### 📸 Screenshots

<div align="center"> 
  
  ![Dashboard](https://github.com/user-attachments/assets/cbcc5380-4531-480a-b8c6-cf415c47dabc)
  
  ![image](https://github.com/user-attachments/assets/a10c2aed-cd39-46e3-bbe9-17373334b12b)

  ![image](https://github.com/user-attachments/assets/5ae693cd-fa54-4084-be29-9877b9d1214c)

</div>


<!-- TechStack -->
### 🧑‍💻 Tech Stack

| Tech             | Description                                                                |
| ----------------- | ------------------------------------------------------------------ |
| AWS | Amazon Web Services (AWS) is a comprehensive cloud computing platform offered by Amazon. It provides a wide range of on-demand computing services and infrastructure resources that allow businesses, developers, and individuals to build, deploy, and manage applications and data without needing to invest in physical hardware. |
| Node.js | Node.js is an open-source, cross-platform JavaScript runtime environment that allows developers to execute JavaScript code outside of a web browser. |
| Serverless Framework | The Serverless Framework is an open-source framework that simplifies the development and deployment of serverless applications, primarily on cloud platforms like AWS Lambda, Google Cloud Functions, and Azure Functions. |
| AWS-CLI | The AWS Command Line Interface (AWS CLI) is a tool for managing AWS resources from the command line. It supports nearly all AWS services, allowing for automation and scripting without using the AWS Management Console. |

<!-- Getting Started -->
## 	🧰 Getting Started

<!-- Prerequisites -->
### 🔩 Prerequisites

This project uses Serverless Framework

```bash
 npm install -g serverless
```

Also we need to install AWS-CLI [here](https://aws.amazon.com/es/cli/) and follow the steps

<!-- Installation -->
### 🛠️ Installation

Install the project with npm

```bash
    npm install
```
   
<!-- Run Locally -->
### ✨ Run Locally

Run the serverless framework to create all you need to interact with the aws server

```bash
  serverless deploy
```



<!-- Run Locally -->
### 🚀 Future improvements

In this repository there are some aspects to improve

- The getMovement route receives the data to be requested as a route parameter, this can be enhanced by using query parameters and giving AWS permission to execute the query on the server.
- Accept required and specific routes in CORS configuration



