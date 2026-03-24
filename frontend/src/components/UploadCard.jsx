const UploadCard = ({ onFileSelect, preview, loading }) => {
  return (
    <div style={styles.card}>
      <input 
        type="file" 
        accept="image/*" 
        onChange={onFileSelect}
        style={styles.input}
      />
      {preview && (
        <img src={preview} alt="Preview" style={styles.preview} />
      )}
      {loading && <p>Processing...</p>}
    </div>
  )
}

const styles = {
  card: { padding: '2rem', background: 'white', borderRadius: '8px' },
  input: { marginBottom: '1rem' },
  preview: { maxWidth: '100%', borderRadius: '8px', marginTop: '1rem' }
}

export default UploadCard
