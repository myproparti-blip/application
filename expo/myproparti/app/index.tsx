import React from "react";
import { SafeAreaView, Platform, StatusBar, View } from "react-native";
import { WebView } from "react-native-webview";
export default function App() {
  // :point_down: Use your local IP from ipconfig
  const localIP = "192.168.29.194"; // your Wi-Fi IPv4 address
  const webUrl =
    Platform.OS === "web"
      ? "http://localhost:3000"
      : `http://${localIP}:3000`;
  // :white_tick: Web Fallback (iframe)
  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1 }}>
        <iframe
          src={webUrl}
          title="My Web App"
          style={{
            width: "100%",
            height: "100vh",
            border: "none",
          }}
        />
      </View>
    );
  }
  // :white_tick: Mobile View (Android / iOS)
  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop:
          Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
      }}
    >
      <WebView
        source={{ uri: webUrl }}
        style={{ flex: 1 }}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        originWhitelist={["*"]}
      />
    </SafeAreaView>
  );
}




















