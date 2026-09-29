const fs = require('fs');
const path = require('path');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\TUF';
const tftLibraryDir = path.join(userProfile, 'Documents', 'Arduino', 'libraries', 'TFT_eSPI');
const targetUserSetup = path.join(tftLibraryDir, 'User_Setup.h');
const esp32ProcessorFile = path.join(tftLibraryDir, 'Processors', 'TFT_eSPI_ESP32.c');
const esp32C3ProcessorFile = path.join(tftLibraryDir, 'Processors', 'TFT_eSPI_ESP32_C3.c');

const config = `// =========================================================================
// TFT_eSPI Configuration for CJack 3.5 Inch TFT LCD Shield (8-Bit Parallel)
// =========================================================================

#define USER_SETUP_INFO "CJack_ESP32_Parallel_ILI9486"

// ESP32 Core 3.x / ESP-IDF 5.x Compatibility Macro
#include <soc/gpio_reg.h>
#include <soc/soc.h>
#ifndef gpio_input_get
#define gpio_input_get() ((uint32_t)REG_READ(GPIO_IN_REG))
#endif

// 1. Display Driver (ILI9486 / ILI9488 8-bit MCU Parallel)
#define ILI9486_DRIVER

// 2. 8-Bit MCU Parallel Interface
#define TFT_PARALLEL_8_BIT

// 3. Control Pins (ESP32)
#define TFT_CS   33  // Chip select
#define TFT_DC   15  // Data/Command (RS)
#define TFT_RST  32  // Reset
#define TFT_WR    4  // Write clock
#define TFT_RD    2  // Read clock

// 4. 8-Bit Data Bus Pins (ESP32)
#define TFT_D0   12
#define TFT_D1   13
#define TFT_D2   26
#define TFT_D3   25
#define TFT_D4   17
#define TFT_D5   16
#define TFT_D6   27
#define TFT_D7   14

// 5. Fonts
#define LOAD_GLCD
#define LOAD_FONT2
#define LOAD_FONT4
#define LOAD_FONT6
#define LOAD_FONT7
#define LOAD_FONT8
#define LOAD_GFXFF
#define SMOOTH_FONT
`;

try {
  // 1. Write User_Setup.h
  fs.writeFileSync(targetUserSetup, config, 'utf8');
  console.log('✓ Updated User_Setup.h with ESP-IDF 5 compatibility');

  // 2. Patch TFT_eSPI_ESP32.c if gpio_input_get is present without macro
  if (fs.existsSync(esp32ProcessorFile)) {
    let content = fs.readFileSync(esp32ProcessorFile, 'utf8');
    if (!content.includes('REG_READ(GPIO_IN_REG)')) {
      content = `#include <soc/gpio_reg.h>\n#include <soc/soc.h>\n#ifndef gpio_input_get\n#define gpio_input_get() ((uint32_t)REG_READ(GPIO_IN_REG))\n#endif\n` + content;
      fs.writeFileSync(esp32ProcessorFile, content, 'utf8');
      console.log('✓ Patched Processors/TFT_eSPI_ESP32.c for ESP32 Arduino Core 3.x');
    }
  }

  // 3. Patch TFT_eSPI_ESP32_C3.c if needed
  if (fs.existsSync(esp32C3ProcessorFile)) {
    let c3Content = fs.readFileSync(esp32C3ProcessorFile, 'utf8');
    if (!c3Content.includes('REG_READ(GPIO_IN_REG)')) {
      c3Content = `#include <soc/gpio_reg.h>\n#include <soc/soc.h>\n#ifndef gpio_input_get\n#define gpio_input_get() ((uint32_t)REG_READ(GPIO_IN_REG))\n#endif\n` + c3Content;
      fs.writeFileSync(esp32C3ProcessorFile, c3Content, 'utf8');
      console.log('✓ Patched Processors/TFT_eSPI_ESP32_C3.c');
    }
  }

  console.log('SUCCESS: All ESP-IDF 5 / ESP32 Core 3.x fixes applied successfully!');
} catch (err) {
  console.error('Error applying patch:', err.message);
}
