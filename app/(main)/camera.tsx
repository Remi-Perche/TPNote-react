import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, Button, Pressable } from "react-native";
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";

const MEDIA_DIR = FileSystem.documentDirectory + "media";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturedMedia, setCapturedMedia] = useState<{ uri: string; type: CameraMode } | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const [recording, setRecording] = useState(false);
  const router = useRouter();

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Nous avons besoin de votre permission pour utiliser la caméra
        </Text>
        <Button onPress={requestPermission} title="Autoriser" />
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo?.uri) {
      setCapturedMedia({ uri: photo.uri, type: "picture" });
    }
  };

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      cameraRef.current?.stopRecording();
      return;
    }
    setRecording(true);
    const video = await cameraRef.current?.recordAsync();
    if (video?.uri) {
      setCapturedMedia({ uri: video.uri, type: "video" });
    }
    setRecording(false);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "picture" ? "video" : "picture"));
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleSave = async () => {
    if (capturedMedia) {
      const dirInfo = await FileSystem.getInfoAsync(MEDIA_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
      }
      const extension = capturedMedia.type === "picture" ? ".jpg" : ".mp4";
      const newName = `media_${Date.now()}${extension}`;
      await FileSystem.copyAsync({
        from: capturedMedia.uri,
        to: MEDIA_DIR + "/" + newName,
      });
      setCapturedMedia(null);
      router.push("/");
    }
  };

  const handleCancel = () => {
    setCapturedMedia(null);
  };

  const renderPreview = () => {
    return (
      <View style={styles.previewContainer}>
        {capturedMedia?.type === "picture" ? (
          <Image
            source={{ uri: capturedMedia.uri }}
            contentFit="contain"
            style={styles.previewMedia}
          />
        ) : (
            <VideoView style={{ width: "100%", height: "90%" }} player={useVideoPlayer(capturedMedia!.uri, player => {
                player.loop = false;
                player.play();
              })} allowsFullscreen allowsPictureInPicture contentFit="contain" />
        )}
        <View style={styles.previewButtons}>
          <Button title="Enregistrer" onPress={handleSave} />
          <Button title="Annuler" onPress={handleCancel} />
        </View>
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        mode={mode}
        facing={facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={styles.shutterContainer}>
          <Pressable onPress={toggleMode}>
            {mode === "picture" ? (
              <AntDesign name="picture" size={32} color="white" />
            ) : (
              <Feather name="video" size={32} color="white" />
            )}
          </Pressable>
          <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                    { backgroundColor: mode === "picture" ? "white" : "red" },
                  ]}
                />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing}>
            <FontAwesome6 name="rotate-left" size={32} color="white" />
          </Pressable>
        </View>
      </CameraView>
    );
  };

  return (
    <View style={styles.container}>
      {capturedMedia ? renderPreview() : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 10,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  previewMedia: {
    width: "100%",
    height: "80%",
  },
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 20,
  },
});