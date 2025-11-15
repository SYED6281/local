# Quick Jenkins Setup Guide

## Step-by-Step Jenkins Configuration

### 1. Add SSH Credentials to Jenkins

Your SSH key file is: **`62818.pem`**

**Steps:**
1. Open Jenkins Dashboard
2. Click **Manage Jenkins** (left sidebar)
3. Click **Manage Credentials**
4. Click on **Global** (or your domain)
5. Click **Add Credentials** (left sidebar)
6. Configure:
   - **Kind**: `SSH Username with private key`
   - **Scope**: `Global`
   - **ID**: `ec2-deploy-key` ⚠️ **Must be exactly this name**
   - **Description**: `EC2 Deployment SSH Key` (optional)
   - **Username**: `ec2-user`
   - **Private Key**: 
     - Select **Enter directly**
     - Click **Add** button
     - Open your `62818.pem` file in a text editor
     - Copy the entire content (including `-----BEGIN` and `-----END` lines)
     - Paste it into the text area
7. Click **OK**

### 2. Verify Your Pipeline Job

1. Go to your Pipeline job (e.g., "Pipeline-123")
2. Click **Configure**
3. Verify:
   - **Pipeline definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/SYED6281/local.git`
   - **Branch**: `*/main`

### 3. Current Configuration

Your pipeline is already configured with:
- ✅ EC2 Host: `3.110.158.31`
- ✅ EC2 User: `ec2-user`
- ✅ App Directory: `/home/ec2-user/app`
- ✅ Credential ID: `ec2-deploy-key` (you need to add this)

### 4. Test the Pipeline

1. Go to your Pipeline job
2. Click **Build Now**
3. Check the console output for any errors

### 5. Common Issues

**Issue: "Credentials not found"**
- Solution: Make sure the credential ID is exactly `ec2-deploy-key`

**Issue: "Permission denied (publickey)"**
- Solution: 
  - Verify the SSH key content is correct (no extra spaces/characters)
  - Make sure username is `ec2-user` (or `ubuntu` for Ubuntu instances)
  - Verify EC2 security group allows SSH from Jenkins server IP

**Issue: "EC2_HOST environment variable is not set"**
- Solution: Already set in Jenkinsfile, but if you see this error, check the Jenkinsfile is up to date

### 6. After Successful Deployment

Your application will be available at:
- **Main**: http://3.110.158.31:3000
- **Health**: http://3.110.158.31:3000/health
- **API Info**: http://3.110.158.31:3000/api/info

## Manual SSH Test (Optional)

To test SSH connection manually from Jenkins server:

```bash
ssh -i /path/to/62818.pem ec2-user@3.110.158.31
```

If this works, Jenkins deployment should work too!

