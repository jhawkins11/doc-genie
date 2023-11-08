import { TextField } from '@mui/material'

const FormInput = ({
  label,
  type,
  value,
  setValue,
  onEnter,
}: {
  label: string
  type: string
  value: string
  setValue: (value: string) => void
  onEnter?: () => void
}) => {
  return (
    <TextField
      aria-label={label}
      label={label}
      type={type}
      variant='outlined'
      fullWidth
      margin='normal'
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (onEnter) {
            onEnter()
          }
        }
      }}
    />
  )
}

export default FormInput
