import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Image,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from "react-native";
import axios from "axios";
import * as MediaLibrary from "expo-media-library";
import { shareAsync } from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { AntDesign } from "@expo/vector-icons";
import dummy from "./data.json";
//Get device width & height
const { height, width } = Dimensions.get("window");

const App = () => {
  const [isLoad, setIsLoad] = useState(false);
  // const [data, setData] = useState(dummy);
  const [images, setImages] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [scale, setScale] = useState(new Animated.Value(1));

  useEffect(() => {
    loadWallpapers();
  }, []);

  // callback for isFocused
  useEffect(() => {
    isFocused
      ? Animated.spring(scale, {
          toValue: 0.9,
          useNativeDriver: true,
          // delay: 1000,
          velocity: 2,
        }).start()
      : Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          // delay: 1000,
          velocity: 2,
        }).start();
  }, [isFocused]);

  // Load wallpapers
  const loadWallpapers = () => {
    axios
      .get("https://api.unsplash.com/photos/random?count=10", {
        headers: {
          Authorization:
            "Client-ID MPPfoHUo7C9hQCh9pBQe_ATkg88OVYugqjlOxRcfIwc",
        },
      })
      .then((res) => {
        setImages(res.data);
        setIsLoad(true);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => console.log("Request completed"));
  };

  // show controls
  const showControls = (image) => {
    setIsFocused((prev) => !prev);
  };

  // Save images
  const saveImage = async (image) => {
    FileSystem.downloadAsync(
      image.urls.regular,
      FileSystem.documentDirectory + image.id + ".jpg"
    )
      .then(async ({ uri }) => {
        let mediaPermission = MediaLibrary.requestPermissionsAsync();
        mediaPermission &&
          (await MediaLibrary.saveToLibraryAsync(uri)
            .then((res) =>
              Alert.alert("Saved", "Image saved to gallery", ["OK"])
            )
            .catch((err) =>
              Alert.alert("Error", "Unable to save image", ["OK"])
            ));
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("Error", "Something went wrong!", ["OK"]);
      });
  };

  // Share image
  const shareImage = async (image) => {
    FileSystem.downloadAsync(
      image.urls.regular,
      FileSystem.documentDirectory + image.id + ".jpg"
    )
      .then(async ({ uri }) => {
        shareAsync(uri)
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("Error", "Something went wrong!", ["OK"]);
      });
  };

  // Render images
  const renderImage = ({ item }) => {
    return (
      <>
        <TouchableWithoutFeedback onPress={() => showControls(item)}>
          <Animated.View
            style={[{ height, width }, { transform: [{ scale: scale }] }]}
          >
            <Image
              style={{ height: null, width: null, flex: 1 }}
              source={{ uri: item.urls.regular }}
              resizeMode={"cover"}
            ></Image>
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.bottomControls,
            {
              transform: [
                {
                  translateY: scale.interpolate({
                    inputRange: [0.9, 1],
                    outputRange: [0, 90],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.bottomButton}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => loadWallpapers()}
            >
              <AntDesign name="reload1" size={30} color="#ddd" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => saveImage(item)}
            >
              <AntDesign name="download" size={30} color="#ddd" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => shareImage(item)}
            >
              <AntDesign name="sharealt" size={30} color="#ddd" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </>
    );
  };

  // Return JSX
  return isLoad ? (
    <View style={styles.container}>
      <Text>Images are loaded</Text>
      <FlatList
        horizontal={true}
        pagingEnabled={true}
        scrollEnabled={!isFocused}
        data={images}
        renderItem={renderImage}
        keyExtractor={(item) => item.id}
      />
    </View>
  ) : (
    <View style={styles.container}>
      <ActivityIndicator size={"large"} color={"#555"} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomControls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor: "#111",
    opacity: 0.95,
  },
  bottomButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});

export default App;
