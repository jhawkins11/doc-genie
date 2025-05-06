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
      className='hover-lift'
      InputLabelProps={{
        className: 'text-gray-300',
        style: { color: '#cbd5e1' },
      }}
      InputProps={{
        className: 'text-white',
        style: {
          backgroundColor: '#1e293b',
          borderColor: '#475569',
          color: 'white',
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#475569',
          },
          '&:hover fieldset': {
            borderColor: '#64748b',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#60a5fa',
          },
        },
      }}
    />
  )
}

export default FormInput
