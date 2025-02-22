import { useState, ReactNode } from "react";
import { View, Dimensions } from "react-native";
import { Tab, TabView, useThemeMode } from "@rneui/themed";
import { cn } from "@/lib/utils";
import { Title } from "./Title";

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
  const { mode } = useThemeMode();

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
              color:
                index === activeTab
                  ? mode === "dark"
                    ? "black"
                    : "white"
                  : mode === "dark"
                  ? "rgba(0, 0, 0, 0.2)"
                  : "rgba(255, 255, 255, 0.2)",
            }}
            containerStyle={{
              position: "relative",
            }}
            size="lg"
          >
            <Title
              className={cn({
                "!text-foreground": index === activeTab,
                "!text-foreground/20": index !== activeTab,
              })}
            >
              {tab.label}
            </Title>
          </Tab.Item>
        ))}
      </Tab>

      <TabView
        value={activeTab}
        onChange={setActiveTab}
        animationType="spring"
        tabItemContainerStyle={
          {
            // backgroundColor: "white",
          }
        }
        containerStyle={
          {
            //backgroundColor: mode === "dark" ? "white" : "rgb(6,8,14)",
          }
        }
      >
        {tabsComponent.map((tab, index) => (
          <TabView.Item key={index}>{tabsComponent[index]}</TabView.Item>
        ))}
      </TabView>
    </View>
  );
};
