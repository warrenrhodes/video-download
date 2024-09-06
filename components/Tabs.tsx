import { useState, ReactNode } from "react";
import { View, Dimensions, Text } from "react-native";
import { Tab, TabView } from "@rneui/themed";
import { cn } from "@/lib/utils";

const { width } = Dimensions.get("window");

export const ScrollableTabs = ({
  tabs,
  initialTab = 0,
  tabsComponent,
}: {
  tabs: { label: string; icons: string; iconType: string }[];
  initialTab?: number;
  tabsComponent: ReactNode[];
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <View className="flex-1">
      <Tab
        value={activeTab}
        onChange={(e) => setActiveTab(e)}
        indicatorStyle={{
          backgroundColor: "white",
          height: 3,
        }}
      >
        {tabs.map((tab, index) => (
          <Tab.Item
            key={index}
            title={tab.label}
            icon={{
              name: tab.icons,
              type: tab.iconType,
              color: index === activeTab ? "white" : "rgba(255, 255, 255, 0.5)",
            }}
            containerStyle={{
              position: "relative",
            }}
            size="lg"
          >
            <Text
              className={cn({
                "text-white": index === activeTab,
                "text-white/40": index !== activeTab,
              })}
            >
              {tab.label}
            </Text>
          </Tab.Item>
        ))}
      </Tab>

      <TabView
        value={activeTab}
        onChange={setActiveTab}
        animationType="spring"
        tabItemContainerStyle={{
          backgroundColor: "white",
        }}
        containerStyle={{ backgroundColor: "white" }}
      >
        {tabsComponent.map((tab, index) => (
          <TabView.Item
            style={{ width: "100%", backgroundColor: "white" }}
            key={index}
          >
            {tabsComponent[index]}
          </TabView.Item>
        ))}
      </TabView>
    </View>
  );
};
