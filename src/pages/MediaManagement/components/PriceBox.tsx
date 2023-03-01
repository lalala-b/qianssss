import cs from 'classnames'
import styles from './PriceBox.scss'

export type PriceBoxListType = {
  title?: string
  value?: number,
  format?: (number: number | undefined) => string
}[]

const PriceBox = ({ list = [] } : { list: PriceBoxListType }) => (
    <div className={ styles.flexCenter }>
      {
        list.map(item => {
          const { title, value, format } = item

          return (
            <div className={ cs(styles.flexCenter, styles.boxItem) } key={title}>
              <div>
                <p className={ styles.title }> { title } </p>
                <p className={ styles.value }> { format ? format(value) : value } </p>
              </div>
            </div>
          )
        })
      }
    </div>
  )

export default PriceBox