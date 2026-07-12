import {
  defineSchema,
  EditorProvider,
  PortableTextEditable,
  useEditor,
  type PortableTextBlock,
  type RenderDecoratorFunction,
  type RenderListItemFunction,
  type RenderStyleFunction,
} from '@portabletext/editor';
import { EventListenerPlugin } from '@portabletext/editor/plugins';
import { Button } from '../Button/Button';

export type RichTextEditorProps = {
  value: PortableTextBlock[];
  onValueChange: (value: PortableTextBlock[]) => void;
  placeholder?: string;
  className?: string;
};

// Kept module-level (not per-render) so `@portabletext/editor` doesn't treat this as
// a new schema on every render.
const schemaDefinition = defineSchema({
  decorators: [{ name: 'strong' }, { name: 'em' }],
  styles: [{ name: 'normal' }],
  lists: [{ name: 'bullet' }, { name: 'number' }],
  annotations: [],
  inlineObjects: [],
  blockObjects: [],
});

const decoratorLabels: Record<string, string> = {
  strong: 'Bold',
  em: 'Italic',
};

const listLabels: Record<string, string> = {
  bullet: 'Bullet list',
  number: 'Numbered list',
};

const editableClasses =
  'min-h-[160px] w-full px-[var(--field-pad-x)] py-[var(--field-pad-y)] font-sans text-sm ' +
  'text-[var(--text-field)] bg-[var(--surface-field)] border border-[var(--border-default)] ' +
  'rounded-md outline-none transition-[border-color,box-shadow] duration-[120ms] ' +
  'focus:border-[var(--focus-ring)] focus:shadow-focus';

const renderDecorator: RenderDecoratorFunction = (props) => {
  if (props.value === 'strong') {
    return <strong>{props.children}</strong>;
  }
  if (props.value === 'em') {
    return <em>{props.children}</em>;
  }
  return <>{props.children}</>;
};

const renderStyle: RenderStyleFunction = (props) => <>{props.children}</>;

const renderListItem: RenderListItemFunction = (props) => <>{props.children}</>;

function Toolbar() {
  const editor = useEditor();

  return (
    <div className="mb-2 flex flex-wrap gap-1">
      {schemaDefinition.decorators.map((decorator) => (
        <Button
          key={decorator.name}
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            editor.send({ type: 'decorator.toggle', decorator: decorator.name });
            editor.send({ type: 'focus' });
          }}
        >
          {decoratorLabels[decorator.name] ?? decorator.name}
        </Button>
      ))}
      {schemaDefinition.lists.map((list) => (
        <Button
          key={list.name}
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            editor.send({ type: 'list item.toggle', listItem: list.name });
            editor.send({ type: 'focus' });
          }}
        >
          {listLabels[list.name] ?? list.name}
        </Button>
      ))}
    </div>
  );
}

export function RichTextEditor({
  value,
  onValueChange,
  placeholder,
  className = '',
}: RichTextEditorProps) {
  return (
    <div className={className}>
      <EditorProvider
        initialConfig={{
          schemaDefinition,
          initialValue: value,
        }}
      >
        <EventListenerPlugin
          on={(event) => {
            if (event.type === 'mutation' && event.value) {
              onValueChange(event.value);
            }
          }}
        />
        <Toolbar />
        <PortableTextEditable
          className={editableClasses}
          hotkeys={{ marks: { 'mod+b': 'strong', 'mod+i': 'em' } }}
          renderStyle={renderStyle}
          renderDecorator={renderDecorator}
          renderBlock={(props) => <div>{props.children}</div>}
          renderListItem={renderListItem}
          renderPlaceholder={placeholder ? () => placeholder : undefined}
        />
      </EditorProvider>
    </div>
  );
}
