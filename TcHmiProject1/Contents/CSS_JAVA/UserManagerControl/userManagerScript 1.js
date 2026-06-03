// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../../Packages/Beckhoff.TwinCAT.HMI.Framework.14.3.431/runtimes/native1.12-tchmi/TcHmi.d.ts" />
//sysManag.js



async function userManager(User, Password, Group, slctUser, Action){
    try{
        const userData = User;
        const passwordData = Password;
        const groupData = Group;
        const act = Action;
        const oldUser = slctUser;
        var   groupName = '';
        var   LogOutTime = "";  

        if(groupData == 1 ){
	        groupName = 'Administrator';
            LogOutTime = "PT15M";
        }
        if(groupData == 2){
	        groupName = 'Engineer';
            LogOutTime = "PT15M";
        }
        if(groupData == 3){
	        groupName = 'Operator';
            LogOutTime = "P30D";
        }

        // Section dadicated for the Actions that the button in HMI will call

        if(act == 'addUser'){
            TcHmi.Server.UserManagement.addUserEx(
                User, 
                Password, 
                {groups: [groupName], enabled: true, locale: 'de', autoLogout: LogOutTime },
                {timeout: 2000},
                function(data) {
                    if (data.error === TcHmi.Errors.NONE) {
                    console.log('done');
                    } else {
                    console.log('fail');
                    }
                }
            );
            console.log(act);
        }
        if(act == 'removeUser'){
            TcHmi.Server.UserManagement.removeUserEx (
                User, 
                null,
                {timeout: 2000},
                function(data) {
                    if (data.error === TcHmi.Errors.NONE) {
                    console.log('done');
                    } else {
                    console.log('error');
                    }
                }
            );
        }
        if(act == 'changeName'){
            TcHmi.Server.UserManagement.updateUser(
                oldUser, 
                {
                newName: User
                },
                function(data) {
                if (data.error === TcHmi.Errors.NONE) {
                console.log('done'); 
                } else {
                console.log('error'); 
                }
                }
            );
        }
        if(act == 'addGroup'){
            TcHmi.Server.UserManagement.updateUser(
                oldUser, 
                {
                addGroups: [groupName]
                },
                function(data) {
                if (data.error === TcHmi.Errors.NONE) {
                console.log('done'); 
                } else {
                console.log('error'); 
                }
                }
            );
        }
        if(act == 'removeGroup'){
            TcHmi.Server.UserManagement.updateUser(
                oldUser, 
                {
                removeGroups: [groupName]
                },
                function(data) {
                if (data.error === TcHmi.Errors.NONE) {
                console.log('done'); 
                } else {
                console.log('error'); 
                }
                }
            );
        }
        if(act == 'changePassword'){
            TcHmi.Server.UserManagement.updateUser(
                oldUser, 
                {
                password: passwordData
                },
                function(data) {
                if (data.error === TcHmi.Errors.NONE) {
                console.log('done'); 
                } else {
                console.log('error'); 
                }
                }
            );
        }

        console.log(userData);
        console.log(passwordData);
        console.log(groupsData);

    } catch (erro){
        console.error(erro);
    }
};
