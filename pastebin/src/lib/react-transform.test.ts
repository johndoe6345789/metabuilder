import { transformReactCode } from './react-transform'

describe('transformReactCode', () => {
  describe('basic component transformation', () => {
    test('transforms simple functional component', () => {
      const code = `
        function MyComponent() {
          return <div>Hello</div>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
      expect(typeof component).toBe('function')
    })

    test('transforms component with explicit name', () => {
      const code = `
        const MyButtonComp = () => <button>Click me</button>
      `
      const component = transformReactCode(code, 'MyButtonComp')
      expect(component).not.toBeNull()
      expect(typeof component).toBe('function')
    })

    test('extracts component name from code', () => {
      const code = `
        const MyButton = () => <button>Click</button>
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
      expect(typeof component).toBe('function')
    })
  })

  describe('export removal', () => {
    test('removes export default statements', () => {
      const code = `
        function MyComp() {
          return <p>Test</p>
        }
        export default MyComp
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('removes regular export statements', () => {
      const code = `
        export function MyComp() {
          return <p>Test</p>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })
  })

  describe('component recognition', () => {
    test('recognizes function declaration component', () => {
      const code = `
        function TestComponent() {
          return <div>Test</div>
        }
      `
      const component = transformReactCode(code)
      expect(component).toBeTruthy()
    })

    test('recognizes const component', () => {
      const code = `
        const TestComponent = () => <div>Test</div>
      `
      const component = transformReactCode(code)
      expect(component).toBeTruthy()
    })

    test('recognizes let component', () => {
      const code = `
        let TestComponent = () => <div>Test</div>
      `
      const component = transformReactCode(code)
      expect(component).toBeTruthy()
    })

    test('recognizes var component', () => {
      const code = `
        var TestComponent = () => <div>Test</div>
      `
      const component = transformReactCode(code)
      expect(component).toBeTruthy()
    })

    test('finds first capital-letter component when no name specified', () => {
      const code = `
        const helper = () => null
        function MainComponent() {
          return <span>Main</span>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })
  })

  describe('component with JSX', () => {
    test('transforms component with JSX elements', () => {
      const code = `
        function MyCard() {
          return (
            <div className="card">
              <h1>Title</h1>
              <p>Description</p>
            </div>
          )
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('transforms component with attributes', () => {
      const code = `
        function Form() {
          return (
            <input type="text" placeholder="Enter name" />
          )
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('transforms component with event handlers', () => {
      const code = `
        function ClickButton() {
          const handleClick = () => alert('Clicked')
          return <button onClick={handleClick}>Click</button>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })
  })

  describe('component with hooks', () => {
    test('transforms component using useState', () => {
      const code = `
        function Counter() {
          const [count, setCount] = useState(0)
          return <div>{count}</div>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('transforms component using useEffect', () => {
      const code = `
        function Effect() {
          useEffect(() => {
            console.log('mounted')
          }, [])
          return <div>Effect</div>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('transforms component using multiple hooks', () => {
      const code = `
        function Complex() {
          const [state, setState] = useState(0)
          useEffect(() => {
            setState(1)
          }, [])
          const memoValue = useMemo(() => state * 2, [state])
          return <div>{memoValue}</div>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })
  })

  describe('TypeScript support', () => {
    test('transforms component with TypeScript types', () => {
      const code = `
        interface Props {
          title: string
        }

        function MyComponent(props: Props) {
          return <h1>{props.title}</h1>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('transforms component with generic types', () => {
      const code = `
        function Container<T>(props: { items: T[] }) {
          return <div>{props.items.length}</div>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })
  })

  describe('error handling', () => {
    test('throws error when no component found and no name specified', () => {
      const code = `
        const x = 5
        const y = 10
      `
      expect(() => transformReactCode(code)).toThrow(
        'No component found. Please specify a function/component name or ensure your code exports a component.'
      )
    })

    test('throws error when result is not a component', () => {
      const code = `
        const notAComponent = 42
      `
      expect(() => transformReactCode(code, 'notAComponent')).toThrow(
        'Code must export a React component or JSX element'
      )
    })

    test('wraps JSX element in functional component', () => {
      const code = `
        const MyElement = <div>Element</div>
      `
      // Passes through because it's a valid React element
      expect(() => transformReactCode(code, 'MyElement')).not.toThrow()
    })
  })

  describe('complex components', () => {
    test('transforms component with conditional rendering', () => {
      const code = `
        function Conditional({ show }) {
          return show ? <div>Shown</div> : <div>Hidden</div>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('transforms component with loops', () => {
      const code = `
        function List({ items }) {
          return (
            <ul>
              {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          )
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('transforms component with nested components', () => {
      const code = `
        function Outer() {
          function Inner() {
            return <span>Inner</span>
          }
          return <div><Inner /></div>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })
  })

  describe('code cleanup', () => {
    test('handles whitespace in exports', () => {
      const code = `
        export   default   function MyComp() {
          return <div>Test</div>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('handles no exports', () => {
      const code = `
        function SimpleComponent() {
          return <p>No export</p>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })
  })

  describe('available UI components', () => {
    test('component can access Button from available components', () => {
      const code = `
        function ButtonComp() {
          return <Button>Click Me</Button>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('component can access Input from available components', () => {
      const code = `
        function InputComp() {
          return <Input type="text" />
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('component can access Card components', () => {
      const code = `
        function CardComp() {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Title</CardTitle>
                <CardDescription>Desc</CardDescription>
              </CardHeader>
              <CardContent>Content</CardContent>
            </Card>
          )
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('component can access Icon components', () => {
      const code = `
        function IconComp() {
          return <Plus size={24} />
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })

    test('component can access toast from sonner', () => {
      const code = `
        function ToastComp() {
          const handleClick = () => toast.success('Success')
          return <button onClick={handleClick}>Show Toast</button>
        }
      `
      const component = transformReactCode(code)
      expect(component).not.toBeNull()
    })
  })

  describe('explicit component naming', () => {
    test('uses provided name over detected name', () => {
      const code = `
        function OldName() {
          return <div>Component</div>
        }
      `
      const component = transformReactCode(code, 'OldName')
      expect(component).not.toBeNull()
    })

    test('handles PascalCase names', () => {
      const code = `
        function Component() {
          return <div>Test</div>
        }
      `
      const component = transformReactCode(code, 'Component')
      expect(component).not.toBeNull()
    })
  })
})
