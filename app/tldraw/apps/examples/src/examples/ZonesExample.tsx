import { OfflineIndicator, Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

export default function Example() {
	return (
		<div className="tldraw__editor">
			<Tldraw persistenceKey="conzept" />
		</div>
	);
  // CONZEPT PATCH
  // <Tldraw topZone={<OfflineIndicator />} shareZone={<CustomShareZone />} />
}

function CustomShareZone() {
	return (
		<div
			style={{
				backgroundColor: 'thistle',
				width: '100%',
				textAlign: 'center',
				minWidth: '80px',
			}}
		>
			<p>Share Zone</p>
		</div>
	)
}
