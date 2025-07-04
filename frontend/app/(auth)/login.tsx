import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { loginUser } from "../../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";

export default function Login() {
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState(""); // username or email
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // not storeToken
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await loginUser({ identifier, password });

      if (response.success) {
        await login(response.data.accessToken);
        router.replace("/dashboard"); // Redirect after login
      } else {
        alert(response.message);
      }
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center px-4 bg-white">
      <Text className="text-2xl font-bold mb-6 text-black">Login</Text>

      <TextInput
        placeholder="Email or Username"
        className="w-full px-4 py-3 rounded-lg bg-gray-100 mb-3"
        onChangeText={setIdentifier}
        value={identifier}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        className="w-full px-4 py-3 rounded-lg bg-gray-100 mb-6"
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity
        onPress={handleLogin}
        className="w-full bg-blue-600 py-3 rounded-lg"
      >
        <Text className="text-center text-white font-semibold">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/forgot-password")}>
        <Text className="text-blue-600 font-medium mt-3">Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text className="mt-4 text-blue-600 font-medium">Create account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
