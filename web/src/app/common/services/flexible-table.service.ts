import { FlexibleTableColumn } from "../components/flexible-table/table-base/flexible-table-base.component";
import { CellTextareaArgs, CellTextareaComponent, CellTextareaHandler } from "../components/flexible-table/cell-components/cell-textarea/cell-textarea.component";
import { CellThumbComponent, CellThumbHandler } from "../components/flexible-table/cell-components/cell-thumb/cell-thumb.component";
import { CellFavoriteHandler, CellFavoriteComponent } from "../components/flexible-table/cell-components/cell-favorite/cell-favorite.component";
import { CellLinkComponent } from "../components/flexible-table/cell-components/cell-link/cell-link.component";
import { CellCopyComponent } from "../components/flexible-table/cell-components/cell-copy/cell-copy.component";
import { CellFlagComponent } from "../components/flexible-table/cell-components/cell-flag/cell-flag.component";
import { CellDelButtonHandler, CellDelButtonComponent } from "../components/flexible-table/cell-components/cell-del-button/cell-del-button.component";

export function CellLabel(label: string): FlexibleTableColumn {
    return {
        label: label
    };
}

export function CellCopy(label: string): FlexibleTableColumn {
    return {
        label: label,
        component: CellCopyComponent,
    };
}

export function CellFavorite(label: string, handler: CellFavoriteHandler): FlexibleTableColumn {
    return {
        label: label,
        component: CellFavoriteComponent,
        handler: convertHandlerList(handler)
    };
}

export function CellFlag(label: string): FlexibleTableColumn {
    return {
        label: label,
        component: CellFlagComponent
    };
}

export function CellLink(label: string): FlexibleTableColumn {
    return {
        label: label,
        component: CellLinkComponent
    };
}

export function CellTextarea(label: string, args: CellTextareaArgs, handler: CellTextareaHandler): FlexibleTableColumn {
    return {
        label: label,
        component: CellTextareaComponent,
        args: args,
        handler: convertHandlerList(handler)
    };
}

export function CellThumb(label: string, handler: CellThumbHandler): FlexibleTableColumn {
    return {
        label: label,
        component: CellThumbComponent,
        handler: convertHandlerList(handler)
    };
}

export function CellDelBtn(label: string, handler: CellDelButtonHandler): FlexibleTableColumn {
    return {
        label: label,
        component: CellDelButtonComponent,
        handler: convertHandlerList(handler)
    };
}

function convertHandlerList(handler:any): { [key: string]: (data: any, component?: any) => void; } {
    const result: { [key: string]: (data: any, component?: any) => void } = {};
    for (const key in handler) {
        if (typeof handler[key] === 'function') {
            result[key] = handler[key].bind(handler);
        }
    }
    return result;
}
