import React, { forwardRef, useMemo } from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Typography } from "./Typography";

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: string[];
  title?: string;
  onClose?: () => void;
}

export const CustomBottomSheet = forwardRef<BottomSheet, BottomSheetProps>(
  ({ children, snapPoints = ["50%"], title, onClose }, ref) => {
    const finalSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={finalSnapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )}
        backgroundStyle={{ backgroundColor: "#161B22" }}
        handleIndicatorStyle={{ backgroundColor: "#30363D", width: 40 }}
      >
        <BottomSheetView className="flex-1 px-4 pb-10">
          {title && (
            <Typography variant="heading" className="mb-6 text-center">
              {title}
            </Typography>
          )}
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

CustomBottomSheet.displayName = "CustomBottomSheet";
