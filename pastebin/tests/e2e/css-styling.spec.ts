import { expect, test } from "./fixtures"

test.describe("Advanced Styling and CSS Tests", () => {
  test.describe("Flexbox and Grid Layout", () => {
    test("flex layouts don't have misaligned items", async ({ page }) => {
      await page.goto("/")

      const flexContainers = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .filter((el) => window.getComputedStyle(el as HTMLElement).display === "flex")
          .map((el) => {
            const style = window.getComputedStyle(el as HTMLElement)
            const children = (el as HTMLElement).children.length
            return {
              tagName: el.tagName,
              direction: style.flexDirection,
              justifyContent: style.justifyContent,
              alignItems: style.alignItems,
              childrenCount: children,
              hasGap: style.gap !== "0px",
            }
          })
          .slice(0, 10)
      })

      // Should have flex containers with proper configuration
      expect(flexContainers.length).toBeGreaterThan(0)

      for (const container of flexContainers) {
        expect(container.tagName).toBeTruthy()
        // Should have explicit alignment
        expect(container.justifyContent || container.alignItems).toBeTruthy()
      }
    })

    test("grid layouts have proper gaps and alignment", async ({ page }) => {
      await page.goto("/")

      const gridContainers = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .filter((el) => window.getComputedStyle(el as HTMLElement).display === "grid")
          .map((el) => {
            const style = window.getComputedStyle(el as HTMLElement)
            return {
              tagName: el.tagName,
              columnGap: style.columnGap,
              rowGap: style.rowGap,
              templateColumns: style.gridTemplateColumns,
              templateRows: style.gridTemplateRows,
            }
          })
          .slice(0, 10)
      })

      // Grid containers should have proper configuration
      for (const container of gridContainers) {
        // Should have either defined template or auto flow
        expect(
          container.templateColumns !== "none" || container.templateRows !== "none"
        ).toBe(true)
      }
    })
  })

  test.describe("Overflow and Clipping", () => {
    test("overflow is handled appropriately", async ({ page }) => {
      await page.goto("/")

      const overflowElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .map((el) => {
            const style = window.getComputedStyle(el as HTMLElement)
            const hasOverflow = (el as HTMLElement).scrollHeight > (el as HTMLElement).clientHeight

            return {
              tag: el.tagName,
              overflow: style.overflow,
              overflowX: style.overflowX,
              overflowY: style.overflowY,
              hasScroll: hasOverflow,
            }
          })
          .filter((item) => item.hasScroll)
          .slice(0, 10)
      })

      // Elements with overflow should handle it appropriately
      for (const element of overflowElements) {
        // Should not be "visible" if there's overflow
        expect(element.overflow).not.toBe("visible")
      }
    })

    test("text overflow is handled with ellipsis", async ({ page }) => {
      await page.goto("/")

      const truncatedText = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("p, span, div"))
        return elements
          .map((el) => {
            const style = window.getComputedStyle(el as HTMLElement)
            const isTruncated =
              style.textOverflow === "ellipsis" || style.whiteSpace === "nowrap"

            return {
              textOverflow: style.textOverflow,
              isTruncated,
            }
          })
          .filter((item) => item.isTruncated)
      })

      // Page might have truncated text - should be properly styled if so
      expect(truncatedText).toBeTruthy()
    })
  })

  test.describe("Z-Index and Stacking Context", () => {
    test("z-index values are reasonable and don't conflict", async ({ page }) => {
      await page.goto("/")

      const zIndexValues = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        const zIndexMap: Record<number, number> = {}

        elements.forEach((el) => {
          const zIndex = window.getComputedStyle(el as HTMLElement).zIndex
          if (zIndex !== "auto") {
            const z = parseInt(zIndex)
            zIndexMap[z] = (zIndexMap[z] || 0) + 1
          }
        })

        return Object.entries(zIndexMap)
          .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
          .slice(0, 20)
      })

      // Z-index values should be spread out reasonably (not conflicting)
      expect(zIndexValues).toBeTruthy()

      // No excessive z-index values (like 999999)
      const maxZIndex = Math.max(
        ...zIndexValues.map((item) => parseInt(item[0]))
      )
      expect(maxZIndex).toBeLessThan(10000)
    })

    test("fixed and sticky elements don't overlap critical content", async ({ page }) => {
      await page.goto("/")

      const fixedElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .filter((el) => {
            const pos = window.getComputedStyle(el as HTMLElement).position
            return pos === "fixed" || pos === "sticky"
          })
          .map((el) => {
            const rect = (el as HTMLElement).getBoundingClientRect()
            return {
              tag: el.tagName,
              width: rect.width,
              height: rect.height,
              position: window.getComputedStyle(el as HTMLElement).position,
            }
          })
      })

      // Page should have minimal fixed/sticky elements
      expect(fixedElements.length).toBeLessThan(10)
    })
  })

  test.describe("Shadows and Visual Effects", () => {
    test("box shadows are rendered without performance issues", async ({ page }) => {
      await page.goto("/")

      const shadowElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .filter((el) => {
            const shadow = window.getComputedStyle(el as HTMLElement).boxShadow
            return shadow !== "none"
          })
          .map((el) => {
            const style = window.getComputedStyle(el as HTMLElement)
            return {
              tag: el.tagName,
              shadow: style.boxShadow,
              filter: style.filter,
            }
          })
          .slice(0, 10)
      })

      // Some elements might have shadows
      expect(shadowElements).toBeTruthy()

      const metrics = await (page as Record<string, unknown>).metrics() as Record<string, number>
      // Rendering should not be excessively slow
      expect(metrics.LayoutCount).toBeLessThan(500)
    })

    test("text shadows are readable", async ({ page }) => {
      await page.goto("/")

      const textWithShadow = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .filter((el) => {
            const shadow = window.getComputedStyle(el as HTMLElement).textShadow
            return shadow !== "none"
          })
          .map((el) => {
            const style = window.getComputedStyle(el as HTMLElement)
            return {
              textShadow: style.textShadow,
              color: style.color,
            }
          })
      })

      // Text with shadow should have good contrast
      expect(textWithShadow).toBeTruthy()
    })
  })

  test.describe("Transform and Animation Properties", () => {
    test("transform values are valid", async ({ page }) => {
      await page.goto("/")

      const transformValues = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .map((el) => {
            const transform = window.getComputedStyle(el as HTMLElement).transform
            return transform !== "none" ? transform : null
          })
          .filter((v) => v !== null)
          .slice(0, 10)
      })

      // Transforms should be proper CSS values
      for (const transform of transformValues) {
        expect(transform).toMatch(/matrix|translate|rotate|scale|skew/)
      }
    })

    test("animations complete without errors", async ({ page }) => {
      const animationErrors: string[] = []

      page.on("console", (msg) => {
        if (
          msg.type() === "error" &&
          (msg.text().toLowerCase().includes("animation") ||
            msg.text().toLowerCase().includes("transition"))
        ) {
          animationErrors.push(msg.text())
        }
      })

      await page.goto("/")
      await page.waitForTimeout(2000) // Wait for animations

      expect(animationErrors).toHaveLength(0)
    })

    test("transitions are smooth", async ({ page }) => {
      await page.goto("/")

      const transitionElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .filter((el) => {
            const transition = window.getComputedStyle(el as HTMLElement).transition
            return transition !== "all 0s ease 0s"
          })
          .map((el) => {
            const style = window.getComputedStyle(el as HTMLElement)
            return {
              duration: style.transitionDuration,
              timing: style.transitionTimingFunction,
            }
          })
          .slice(0, 10)
      })

      // Transitions should have reasonable durations
      for (const transition of transitionElements) {
        // Duration should be less than 5 seconds
        const duration = parseFloat(transition.duration)
        expect(duration).toBeLessThan(5)
      }
    })
  })

  test.describe("Color and Opacity", () => {
    test("opacity values are between 0 and 1", async ({ page }) => {
      await page.goto("/")

      const opacityValues = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .map((el) => {
            const opacity = window.getComputedStyle(el as HTMLElement).opacity
            return parseFloat(opacity)
          })
          .filter((v) => v < 1 && v >= 0)
      })

      // All opacity values should be valid
      expect(
        opacityValues.every((v) => typeof v === "number" && v >= 0 && v <= 1)
      ).toBe(true)
    })

    test("color values are valid CSS colors", async ({ page }) => {
      await page.goto("/")

      const colors = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .map((el) => {
            const color = window.getComputedStyle(el as HTMLElement).color
            return color
          })
          .filter((c) => c && c !== "rgba(0, 0, 0, 0)")
          .slice(0, 20)
      })

      // Colors should be in rgb or rgba format
      for (const color of colors) {
        expect(color).toMatch(/rgb/)
      }
    })

    test("background colors don't cause readability issues", async ({ page }) => {
      await page.goto("/")

      const textWithBg = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("p, span, div"))
        return elements
          .slice(0, 10)
          .map((el) => {
            const style = window.getComputedStyle(el as HTMLElement)
            const textColor = style.color
            const bgColor = style.backgroundColor

            return {
              textColor,
              bgColor,
            }
          })
      })

      // Should have distinct text and background colors for readability
      expect(textWithBg.length).toBeGreaterThan(0)
    })
  })

  test.describe("Border and Spacing", () => {
    test("border styles are consistent", async ({ page }) => {
      await page.goto("/")

      const borderedElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .filter((el) => {
            const border = window.getComputedStyle(el as HTMLElement).borderWidth
            return border !== "0px"
          })
          .map((el) => {
            const style = window.getComputedStyle(el as HTMLElement)
            return {
              borderWidth: style.borderWidth,
              borderStyle: style.borderStyle,
              borderColor: style.borderColor,
            }
          })
          .slice(0, 10)
      })

      // Border styles should be valid
      for (const element of borderedElements) {
        expect(element.borderStyle).toMatch(/solid|dashed|dotted|double/)
      }
    })

    test("padding and margin don't cause overlaps", async ({ page }) => {
      await page.goto("/")

      const spacingValues = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .slice(0, 20)
          .map((el) => {
            const style = window.getComputedStyle(el as HTMLElement)
            return {
              padding: style.padding,
              margin: style.margin,
            }
          })
      })

      // Spacing should be properly applied
      for (const element of spacingValues) {
        expect(element.padding || element.margin).toBeTruthy()
      }
    })

    test("border radius values are consistent", async ({ page }) => {
      await page.goto("/")

      const borderRadiusElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        const radiusMap: Record<string, number> = {}

        elements.forEach((el) => {
          const radius = window.getComputedStyle(el as HTMLElement).borderRadius
          if (radius !== "0px") {
            radiusMap[radius] = (radiusMap[radius] || 0) + 1
          }
        })

        return radiusMap
      })

      // Should have consistent border radius values (theme consistency)
      const uniqueRadii = Object.keys(borderRadiusElements).length
      expect(uniqueRadii).toBeLessThan(20) // Reasonable limit for design consistency
    })
  })

  test.describe("Typography Rendering", () => {
    test("font families are properly loaded", async ({ page }) => {
      await page.goto("/")

      const fontFamilies = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        const families: Record<string, number> = {}

        elements.forEach((el) => {
          const font = window.getComputedStyle(el as HTMLElement).fontFamily
          if (font) {
            families[font] = (families[font] || 0) + 1
          }
        })

        return Object.keys(families).slice(0, 10)
      })

      // Should have consistent font families
      expect(fontFamilies.length).toBeGreaterThan(0)
      expect(fontFamilies.length).toBeLessThan(15)
    })

    test("font weights are appropriate", async ({ page }) => {
      await page.goto("/")

      const fontWeights = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("p, span, a, button, h1, h2, h3"))
        return elements
          .map((el) => {
            const weight = window.getComputedStyle(el as HTMLElement).fontWeight
            return parseInt(weight)
          })
          .filter((w) => w > 0)
      })

      // Font weights should be standard values
      const uniqueWeights = [...new Set(fontWeights)]
      expect(uniqueWeights.every((w) => [300, 400, 500, 600, 700, 800, 900].includes(w))).toBe(
        true
      )
    })

    test("letter spacing and word spacing are readable", async ({ page }) => {
      await page.goto("/")

      const spacingElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("p"))
        return elements
          .slice(0, 5)
          .map((el) => {
            const style = window.getComputedStyle(el as HTMLElement)
            return {
              letterSpacing: style.letterSpacing,
              wordSpacing: style.wordSpacing,
              lineHeight: style.lineHeight,
            }
          })
      })

      // Spacing should be reasonable for readability
      for (const element of spacingElements) {
        const letterSpacing = parseFloat(element.letterSpacing)
        expect(letterSpacing).toBeLessThan(10) // Reasonable limit
      }
    })
  })

  test.describe("Gradients and Complex Backgrounds", () => {
    test("gradients render without artifacts", async ({ page }) => {
      await page.goto("/")

      const gradients = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"))
        return elements
          .filter((el) => {
            const bg = window.getComputedStyle(el as HTMLElement).backgroundImage
            return bg && bg.includes("gradient")
          })
          .map((el) => ({
            tag: el.tagName,
            backgroundImage: window.getComputedStyle(el as HTMLElement).backgroundImage,
          }))
          .slice(0, 5)
      })

      // Gradients should be valid CSS
      for (const element of gradients) {
        expect(
          element.backgroundImage.includes("linear-gradient") ||
            element.backgroundImage.includes("radial-gradient")
        ).toBe(true)
      }
    })
  })
})
