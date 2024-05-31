import { View, Text,ScrollView,TouchableOpacity,Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { ResizeMode, Video } from 'expo-av'
import { icons } from '../../constants'
import * as DocumentPicker from 'expo-document-picker'
import { router } from 'expo-router'
import { createVideo } from '../../lib/appwriteConfig'
import { useGlobalContext } from '../../context/GlobalProvider'


const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [videoForm, setVideoForm] = useState({
    title: "",
    video: null,
    thumbnail: null,
    prompt: "",
  });

  // to open recent video in users gallery
  const openPicker = async (selectType) => {
    const result = await DocumentPicker.getDocumentAsync({
      type:selectType ==="image"
      ? ["image/png", "image/jpg", "image/jpeg"]
      : ["video/mp4","video/gif"]
    })
    if(!result.canceled){
      if(selectType === "image"){
        setVideoForm({...videoForm,
          thumbnail: result.assets[0]})
    }
    if(selectType === "video"){
      setVideoForm({...videoForm,
        video: result.assets[0]})
  }

  } }
   const submit = async () => {
    if("videoForm.prompt" === "" || "videoForm.title" === "" || "videoForm.video" === null || "videoForm.thumbnail" === null){
      return Alert.alert("All fields are required")
    }
    setUploading(true)
    try {
      await createVideo({...videoForm, userId: user.$id})
      Alert.alert("Video Uploaded successfully")
      router.replace("/home") 
    } catch (error) {
      throw Error(error)
    } finally{
      setVideoForm({
        title: "",
        video: null,
        thumbnail: null,
        prompt: "",
      })
      setUploading(false)
    }
   }
  
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">Upload Video</Text>
        <FormField
          title="Video Title"
          value={videoForm.title}
          placeholder="Give your Video a catch title"
          handleChangeText={(e) => setVideoForm({ ...videoForm, title: e })}
          otherStyles="mt-10"
        />
        <View>
          <Text className="text-base text-gray-100 font-pmedium">Upload Video</Text>
          <TouchableOpacity onPress={()=> openPicker('video')}>
            {videoForm.video ? (
              <Video
              source={{ uri: videoForm.video.uri }}
              className="w-full h-64 rounded-2xl"
              useNativeControls 
              resizeMode={ResizeMode.COVER}
              isLooping
              />
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image
                  source={icons.upload}
                  resizeMode='contain'
                  className="w-1/2 h-1/2" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View className="mt-7 space-y-2">
        <Text className="text-base text-gray-100 font-pmedium">Upload Thumbnail</Text>
        <TouchableOpacity onPress={()=> openPicker('image')}>
            {videoForm.thumbnail ? (
              <Image
              source={{uri : videoForm.thumbnail.uri}}
              className="w-full h-64 rounded-2xl"
              resizeMode="cover"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
                  <Image
                  source={icons.upload}
                  resizeMode='contain'
                  className="w-5 h-5" />
                  <Text className="text-sm text-gray-100 font-pmedium"></Text>
                </View>
            )}
          </TouchableOpacity>
        </View>
        <FormField
          title="AI Prompt"
          value={videoForm.prompt}
          placeholder="The prompt you used to create this video"
          handleChangeText={(e) => setVideoForm({ ...videoForm, prompt: e })}
          otherStyles="mt-7"
        />
        <CustomButton
          title="Upload Video"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default Create