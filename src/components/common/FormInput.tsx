import { TextField } from '@mui/material'

const FormInput = ({
  label,
  type,
  value,
  setValue,
  onEnter,
  isDarkMode = false,
}: {
  label: string
  type: string
  value: string
  setValue: (value: string) => void
  onEnter?: () => void
  isDarkMode?: boolean
}) => {
  return (
    <TextField
      aria-label={label}
      label={label}
      type={type}
      variant='outlined'
      fullWidth
      margin='normal'
      value={value || ''}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (onEnter) {
            onEnter()
          }
        }
      }}
      className='dark:text-gray-200'
      InputLabelProps={{
        className: 'dark:text-gray-300',
      }}
      InputProps={{
        className: 'dark:text-gray-200 dark:border-gray-700',
      }}
    />
  )
}

export default FormInput
