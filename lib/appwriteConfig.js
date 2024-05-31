import { Client,Account, Avatars, Databases, Query,Storage } from 'react-native-appwrite';
import { ID } from 'react-native-appwrite';


//---------------how to connect the app with appwrite database-----------------------------------------------
export const appwriteConfig = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: "com.jsm.aora",
    projectId:"664f015d0008858da39c",
    databaseId:"664f02730029ec11eb77",
    userCollectionId:"664f0287001334008ed6",
    videoCollectionId:"664f029f000a2dbf0938",
    storageId:"664f038e0003107a9219"
}
//--------------------------------------------------------------------------


// ----------------// Init your React Native SDK // ----------------//
const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
    .setProject(appwriteConfig.projectId) // Your project ID
    .setPlatform(appwriteConfig.platform) // Your application ID or bundle ID.

    const account = new Account(client);
    const avatars = new Avatars(client);
    const databases = new Databases(client)
    const storage = new Storage(client)
//--------------------------------------------------------------------------//

//-----------------------------------// Register User //-----------------------------------//
export const createUser = async (email,password,username) => {
    try {
        const newAccount = await account.create(
            //needed inputs for creating an account
            ID.unique(),
            email,
            password,
            username
        )
        if (!newAccount) throw Error
            
        //after creating account succesfully, to create an avatar for the account
        const avatarUrl = avatars.getInitials(username)
        //here we activate siging in function to let people sign in after created an account
        await signingIn(email,password)
// here we save the additional information belonging to the user into the db
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar:avatarUrl
            }
        )
        return newUser;
        //----------------------------------------------------------------------------------------//
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }

}
export const signingIn = async  (email,password) => {
    try {
        //this part checks incoming email and password in order to create a session for the user
        const session = await account.createEmailPasswordSession(email,password)
        return session;
    } catch (error) {
        throw new Error(error)
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get()

        if (!currentAccount) throw Error;
        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if(!currentUser) throw Error;
        return currentUser.documents[0]

    } catch (error) {
        console.log(error);
    }
}

export const getAllPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.orderDesc('$createdAt')]

        )
        return posts.documents;
        
    } catch (error) {
        throw new Error(error)
        
        
    }
}
export const getLatestPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.orderDesc('$createdAt',Query.limit(7))]

        )
        return posts.documents;
        
    } catch (error) {
        throw new Error(error)
        
        
    }
}
export const searchPosts = async (query) => {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.search('title',query)]

        )
        return posts.documents;
        
    } catch (error) {
        throw new Error(error)
        
        
    }
}

export const getUsersPosts = async (userId) => {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.equal('creator',userId)]

        )
        return posts.documents;
        
    } catch (error) {
        throw new Error(error)
        
        
    }
}
export const signOut = async () => {
    try {
        await account.deleteSession('current')
    } catch (error) {
        throw new Error(error)
    }
}

// --------------------------------------// Create a Post //--------------------------------------//
export const getFilePreview = async(fileId,type) => {
    let fileUrl;
    try {
        if(type === 'video'){
            fileUrl = storage.getFileView(appwriteConfig.storageId,fileId)
        }else if (type ==='image') {
            fileUrl = storage.getFilePreview(appwriteConfig.storageId,fileId,2000,2000,"top",100)
        } else {
            throw new Error("Invalid file type")
        }
        if(!fileUrl) throw Error;
        return fileUrl;
    } catch (error) {
        throw new Error(error)
    }

}
export const uploadFile = async(file,type) => {
    if(!file) return;
    const {mimeType,...rest} = file;
    const asset= { type:mimeType, ...rest}
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            asset
        )
        const fileUrl = await getFilePreview(uploadedFile.$id,type)
        return fileUrl;
    } catch (error) {
        throw new Error(error)
    }
}
export const createVideo = async (videoForm) => {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(videoForm.thumbnail,'image'),
            uploadFile(videoForm.video,'video')
        ])

    const newPost =  await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.videoCollectionId,
        ID.unique(),
        {
            title: videoForm.title,
            prompt: videoForm.prompt,
            video: videoUrl,
            thumbnail: thumbnailUrl,
            creator: videoForm.userId
        }
    )
    return newPost;
        
    } catch (error) {
        throw new Error(error)
        
    }
}