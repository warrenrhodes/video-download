import Toast from "react-native-root-toast";

export const displayMessage = ({
  message,
  messageType,
}: {
  message: string;
  messageType: "success" | "error";
}) =>
  Toast.show(message, {
    duration: Toast.durations.LONG,
    position: Toast.positions.TOP,
    textColor: "white",
    textStyle: {
      fontSize: 16,
      fontWeight: "bold",
    },
    backgroundColor: messageType === "success" ? "green" : "red",
    shadowColor: "black",
    shadow: true,
    keyboardAvoiding: true,
    hideOnPress: true,
    containerStyle: {
      opacity: 1,
      padding: 10,
      borderRadius: 5,
      marginTop: 40,
    },
  });

export default Toast;
