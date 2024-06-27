const SplashScreen = () => {
    return (
      <div className='App' style={
        {backgroundColor: '#fff9f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p className='logo' style={{fontFamily: 'Caveat', fontSize: 42}}>
          Public domain IPTV
        </p>
      </div>
    )
  }

export default SplashScreen;