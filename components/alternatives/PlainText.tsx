import { Fragment } from 'react';
import styles from './plain-text.module.css';

export function PlainText({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith('**') && part.endsWith('**')
    ? <mark key={index} className={styles.highlight}>{part.slice(2, -2)}</mark>
    : <Fragment key={index}>{part}</Fragment>)}</>;
}
