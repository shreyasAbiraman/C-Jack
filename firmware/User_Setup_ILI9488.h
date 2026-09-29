// =========================================================================
// TFT_eSPI User_Setup.h for 3.5" 8-bit Parallel TFT LCD Shield
// Target Display: 3.5" TFT LCD Shield (ILI9486 / ILI9488) - 8-Bit Parallel
// Target MCU: ESP32-WROOM-32 (30-pin Board)
// =========================================================================

#define USER_SETUP_INFO "ESP32_8Bit_Parallel_3.5_TFT"

// 1. Enable 8-Bit Parallel Mode (CRITICAL for Arduino UNO/Mega Shield)
#define TFT_PARALLEL_8_BIT

// 2. Display Driver Selection
// Try ILI9486_DRIVER first (standard for 3.5" Uno Shields)
// If display is mirrored or blank, switch to ILI9488_DRIVER
#define ILI9486_DRIVER
// #define ILI9488_DRIVER

// 3. Screen Dimensions
#define TFT_WIDTH  320
#define TFT_HEIGHT 480

// 4. Control Pin Mapping
#define TFT_CS   33  // LCD_CS  -> ESP32 GPIO 33 (D33)
#define TFT_DC   15  // LCD_RS  -> ESP32 GPIO 15 (D15)
#define TFT_RST  32  // LCD_RST -> ESP32 GPIO 32 (D32)
#define TFT_WR    4  // LCD_WR  -> ESP32 GPIO 4  (D4)
#define TFT_RD    2  // LCD_RD  -> ESP32 GPIO 2  (D2)

// 5. 8-Bit Parallel Data Bus Pin Mapping
#define TFT_D0   12  // LCD_D0 -> ESP32 GPIO 12 (D12)
#define TFT_D1   13  // LCD_D1 -> ESP32 GPIO 13 (D13)
#define TFT_D2   26  // LCD_D2 -> ESP32 GPIO 26 (D26)
#define TFT_D3   25  // LCD_D3 -> ESP32 GPIO 25 (D25)
#define TFT_D4   17  // LCD_D4 -> ESP32 GPIO 17 (TX2)
#define TFT_D5   16  // LCD_D5 -> ESP32 GPIO 16 (RX2)
#define TFT_D6   27  // LCD_D6 -> ESP32 GPIO 27 (D27)
#define TFT_D7   14  // LCD_D7 -> ESP32 GPIO 14 (D14)

// 6. Fonts
#define LOAD_GLCD
#define LOAD_FONT2
#define LOAD_FONT4
#define LOAD_FONT6
#define LOAD_FONT7
#define LOAD_FONT8
#define LOAD_GFXFF
#define SMOOTH_FONT
