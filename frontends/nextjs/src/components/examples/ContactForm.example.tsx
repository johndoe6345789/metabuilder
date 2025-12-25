// Example component demonstrating best practices with comprehensive documentation
// This file serves as a reference for building well-documented components

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks'

/**
 * FormState - Manages the state of a form with values and errors
 */
interface FormState {
  email: string
  message: string
}

/**
 * FormErrors - Type for form validation errors
 */
type FormErrors = {
  [K in keyof FormState]?: string
}

/**
 * ContactFormProps - Props for the ContactForm component
 */
interface ContactFormProps {
  /** Callback when form is successfully submitted */
  onSubmit?: (data: FormState) => void
  /** Optional CSS class name */
  className?: string
  /** Whether to show debug information */
  debug?: boolean
}

/**
 * ContactForm - A form component for collecting user contact information
 * 
 * This component demonstrates best practices for React forms including:
 * - Form state management with useState
 * - Input validation with error messages
 * - Permission-based rendering
 * - Callback handling for parent communication
 * - Proper TypeScript typing
 * 
 * @component
 * @example
 * return (
 *   <ContactForm
 *     onSubmit={(data) => console.log('Form submitted:', data)}
 *     debug={true}
 *   />
 * )
 * 
 * @param props - Component props
 * @returns React component for contact form
 */
export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  className = '',
  debug = false,
}) => {
  // Current user from authentication context
  const { user } = useAuth()
  
  // Form state containing email and message fields
  const [formData, setFormData] = useState<FormState>({
    email: '',
    message: '',
  })
  
  // Track validation errors for each field
  const [errors, setErrors] = useState<FormErrors>({})
  
  // Track loading state during form submission
  const [isLoading, setIsLoading] = useState(false)
  
  // Track successful submission
  const [submitted, setSubmitted] = useState(false)
  
  /**
   * Validates form data before submission
   * @returns true if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Validate email field
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    // Validate message field
    if (!formData.message) {
      newErrors.message = 'Message is required'
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  /**
   * Handles input changes and updates form state
   * @param e - The input change event
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
      
      // Clear error for this field when user starts typing
      if (errors[name as keyof FormState]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined,
        }))
      }
    },
    [errors]
  )
  
  /**
   * Handles form submission with validation
   * @param e - The form submission event
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      
      // Validate form before submission
      if (!validateForm()) {
        return
      }
      
      setIsLoading(true)
      
      try {
        // Call parent callback if provided
        onSubmit?.(formData)
        
        // Reset form state on successful submission
        setFormData({ email: '', message: '' })
        setSubmitted(true)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSubmitted(false), 3000)
      } catch (error) {
        console.error('Form submission error:', error)
        setErrors({
          message: 'An error occurred while submitting the form',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [formData, onSubmit]
  )
  
  // Only render for authenticated users (Level 2+)
  if (!user) {
    return (
      <div className="text-center text-gray-500">
        Please log in to contact us.
      </div>
    )
  }
  
  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 p-4 border rounded-lg ${className}`}
    >
      {/* Form title */}
      <h2 className="text-2xl font-bold">Contact Us</h2>
      
      {/* Success message */}
      {submitted && (
        <div className="p-2 bg-green-100 text-green-700 rounded">
          Thank you! Your message has been sent.
        </div>
      )}
      
      {/* Email input field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block font-medium">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="your@email.com"
          disabled={isLoading}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {/* Display email validation error */}
        {errors.email && (
          <p id="email-error" className="text-red-600 text-sm">
            {errors.email}
          </p>
        )}
      </div>
      
      {/* Message textarea field */}
      <div className="space-y-2">
        <label htmlFor="message" className="block font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange as any}
          placeholder="Your message here..."
          rows={5}
          disabled={isLoading}
          className="w-full p-2 border rounded"
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {/* Display message validation error */}
        {errors.message && (
          <p id="message-error" className="text-red-600 text-sm">
            {errors.message}
          </p>
        )}
      </div>
      
      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Sending...' : 'Send Message'}
      </Button>
      
      {/* Debug information - only shown in development */}
      {debug && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-sm font-mono">
          <p>Current user: {user.email}</p>
          <p>User level: {user.level}</p>
          <p>Form dirty: {formData.email || formData.message ? 'yes' : 'no'}</p>
        </div>
      )}
    </form>
  )
}
