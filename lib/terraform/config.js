'use strict';

module.exports = {

    terraform: {
        applyCommand: 'terraform init && sleep 1 && terraform apply -auto-approve',
        destroyCommand: 'terraform init && sleep 1 && terraform destroy -auto-approve',
        excludeResourceCommand: 'terraform state rm ',

        stateFileName: 'terraform.tfstate',
        stateFileReadMaxAttempts: 5,
        stateFileReadTimeout: 500,

        templateDefaultName: 'main.tf',
        tempFolderPrefix: 'terraform-',

        errorExcludedMessage: 'Terraform does not automatically rollback in the face of errors',

        backupLocation: `${__dirname}/backups/`
    }

};
