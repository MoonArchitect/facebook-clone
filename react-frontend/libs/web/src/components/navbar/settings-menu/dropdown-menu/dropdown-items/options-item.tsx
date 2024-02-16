import { ReactNode, useCallback, useEffect, useState } from "react"

import commonStyles from "./common-item-styles.module.scss"

interface OptionsItemProps {
  leftIcon: ReactNode
  optionId: string
  title: string
  description: string
  options: [string, ...string[]]
  defaultId?: number
  changeAction?: (option: string) => void
}

export const OptionsItem = (props: OptionsItemProps) => {
  const {
    leftIcon,
    optionId,
    title,
    description,
    options,
    defaultId = 0,
    changeAction,
  } = props

  const [option, setOption] = useState("")

  // TODO: unify user option store so that ui state and user settings are the same thing
  const handleOptionChange = useCallback(
    (optionValue: string) => {
      localStorage.setItem(`option-${optionId}`, optionValue)
      setOption(optionValue)
      changeAction?.(optionValue)
    },
    [optionId, changeAction]
  )

  // options should be read on app startup and stored in global state
  useEffect(() => {
    const storedOption = localStorage.getItem(`option-${optionId}`)
    storedOption === null
      ? setOption(options[defaultId])
      : setOption(storedOption)
  }, [defaultId, optionId, options])

  return (
    <div className={commonStyles.optionsItem}>
      <div className={commonStyles.menuIconButton}>{leftIcon}</div>

      <div>
        <div className={commonStyles.optionsItemTitle}>{title}</div>
        <div className={commonStyles.optionsItemDescription}>{description}</div>
        <div className={commonStyles.optionsItemOptionContainer}>
          {options.map((optionValue) => (
            <label
              key={`${optionId}-${optionValue}`}
              className={commonStyles.optionsItemOption}
              htmlFor={`${optionId}-${optionValue}`}
            >
              {optionValue}

              <input
                type="radio"
                name={optionId}
                id={`${optionId}-${optionValue}`}
                checked={option === optionValue}
                onChange={() => handleOptionChange(optionValue)}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
