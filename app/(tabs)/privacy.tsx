import { ScrollView, View } from "react-native";
import Markdown from "react-native-markdown-display";

export default function Privacy() {
  return (
    <View className="flex-1 flex-col gap-3 py-3 bg-background p-3">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ height: "50%" }}
      >
        <Markdown>{`

## **Video Max Downloader Online** - Privacy Policy

**Last updated September 23, 2024**

--- 

## **Introduction**

- **Video Max Downloader** takes Users' privacy very seriously, and We are committed to protecting and respecting Users' privacy. That value powers all of the decisions We make, including how We collect, use, share, store, and respect Users' personal data.

- This Privacy Policy applies to Users of our **Video Max Downloader** Apps. It is important that You read this Policy together with any other privacy policies or fair processing policies We may provide on specific occasions so that You are fully aware of when, why, and how We collect and process your personal data. If You disagree with this Policy in whole or part, You are entitled to terminate using our Apps at any time.

- **Video Max Downloader** reserves the right to amend this Policy or related agreements at any time without notice, which shall take effect and apply immediately. If You disagree, You have the right to stop the Services agreed herein. Once the changes to our agreements have been published, Your continued use of **Video Max Downloader**'s Services is deemed to have fully read, understood, and accepted the changed agreements, and You shall abide by such agreements.

## **Data Controller and Data Processor**

- **Video Max Downloader** is both the data controller and data processor, determining the purposes and methods of data processing concerning your personal data collected by us, and is responsible for the data processing for your use of our services. If You have any questions, You can contact **Video Max Downloader** at developers@karibu-cap.com.

---

## **Personal Data We Collect**

- Personal data refers to any information that can identify an individual, such as name, email address, or location. However, we **do not** collect any personal data when you use **Video Max Downloader**. We automatically collect information about the device you use to access our services, including the type and model of the device, operating system, and mobile network information. This is for internal operations, troubleshooting, and improving our services. Our services require access to your device's storage to store downloaded videos. However, we do **not** collect any content (videos, photos, etc.) from your device's storage.


----


## **How We Use Your Data**

- We do **not** collect or store personal data like account details, social platform passwords, or payment information. We only use device data to:

  - Administer and improve our services.
  - Conduct internal analysis, such as testing and research.
  - Comply with any legal obligations or respond to legal processes.

- **PLEASE NOTE** that our services require access to your device's storage application in order to store the completed videos, but We do **not** take any information, videos, photos, or other content from your device's video storage application. You can also disable such access permission in the settings of your phone if You do not think it's necessary.

## **Database and Similar Technologies**

We may use local storage, or similar technologies on our Apps to store downloaded video information locally on your device(s).

## **How Long We Store Your Personal Data**

- Again, We **DO NOT** store your personal data.

- **PLEASE NOTE** that the photos, videos, or any other contents You download with our Apps will be stored in your photo album or local folder on your device(s), and will **not** be stored by us.

---

## **Contact Us**

If You have any questions about this Privacy Policy or our privacy practices, or if You wish to exercise your rights in respect of your personal data, please contact us via email at: developers@karibu-cap.com.

---

**Copyright © 2024 Karibu-cap. All rights reserved.**


`}</Markdown>
      </ScrollView>
    </View>
  );
}
